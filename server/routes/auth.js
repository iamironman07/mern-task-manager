const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: { id: user._id, name } });
  } catch (e) {
    res.status(e.code === 11000 ? 409 : 500).json({ error: e.code === 11000 ? 'Email already used' : 'Server error' });
  }
});
router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
    return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: sign(user), user: { id: user._id, name: user.name } });
});
module.exports = router;
