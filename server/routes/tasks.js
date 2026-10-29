const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');

router.use((req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id; next();
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
});

router.get('/', async (req, res) => {
  const filter = { user: req.userId };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) filter.title = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  res.json(await Task.find(filter).sort({ createdAt: -1 }));
});
router.post('/', async (req, res) => {
  const { title, description, priority, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  res.status(201).json(await Task.create({ user: req.userId, title, description, priority, dueDate }));
});
router.put('/:id', async (req, res) => {
  const t = await Task.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true, runValidators: true });
  t ? res.json(t) : res.status(404).json({ error: 'Not found' });
});
router.delete('/:id', async (req, res) => {
  const t = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  t ? res.json({ message: 'Deleted' }) : res.status(404).json({ error: 'Not found' });
});
module.exports = router;
