import { useEffect, useState } from 'react';
import { api } from './api.js';

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault(); setError('');
    try {
      const d = await api('/auth/' + mode, 'POST', form);
      localStorage.setItem('token', d.token);
      localStorage.setItem('name', d.user.name);
      onAuth();
    } catch (err) { setError(err.message); }
  };
  return (
    <form className="card auth" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Login' : 'Create account'}</h2>
      {mode === 'register' && <input placeholder="Name" value={form.name} onChange={set('name')} required />}
      <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
      <input type="password" placeholder="Password" value={form.password} onChange={set('password')} required />
      {error && <p className="error">{error}</p>}
      <button>{mode === 'login' ? 'Login' : 'Register'}</button>
      <a href="#" onClick={e => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); }}>
        {mode === 'login' ? 'Need an account?' : 'Already registered?'}
      </a>
    </form>
  );
}

function Tasks({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState({ title: '', priority: 'medium', dueDate: '' });

  const load = async () => {
    const qs = new URLSearchParams({ ...(filter && { status: filter }), ...(search && { q: search }) });
    setTasks(await api('/tasks?' + qs));
  };
  useEffect(() => { load(); }, [filter, search]);

  const add = async e => {
    e.preventDefault();
    await api('/tasks', 'POST', { ...draft, dueDate: draft.dueDate || undefined });
    setDraft({ title: '', priority: 'medium', dueDate: '' }); load();
  };
  const update = async (id, patch) => { await api('/tasks/' + id, 'PUT', patch); load(); };
  const remove = async id => { await api('/tasks/' + id, 'DELETE'); load(); };

  const counts = s => tasks.filter(t => t.status === s).length;
  return (
    <div className="container">
      <header>
        <h1>My Tasks</h1>
        <span>{localStorage.getItem('name')} <button onClick={onLogout}>Logout</button></span>
      </header>
      <p className="stats">To do: {counts('todo')} · In progress: {counts('in-progress')} · Done: {counts('done')}</p>
      <form className="row" onSubmit={add}>
        <input placeholder="New task..." value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} required />
        <select value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value })}>
          <option>low</option><option>medium</option><option>high</option>
        </select>
        <input type="date" value={draft.dueDate} onChange={e => setDraft({ ...draft, dueDate: e.target.value })} />
        <button>Add</button>
      </form>
      <div className="row">
        <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All</option><option value="todo">To do</option>
          <option value="in-progress">In progress</option><option value="done">Done</option>
        </select>
      </div>
      <ul>
        {tasks.map(t => (
          <li key={t._id} className={'card ' + t.status}>
            <div>
              <strong>{t.title}</strong>
              <small> [{t.priority}]{t.dueDate && ' · due ' + t.dueDate.slice(0, 10)}</small>
            </div>
            <div>
              <select value={t.status} onChange={e => update(t._id, { status: e.target.value })}>
                <option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option>
              </select>
              <button onClick={() => remove(t._id)}>Delete</button>
            </div>
          </li>
        ))}
        {!tasks.length && <p className="muted">No tasks yet.</p>}
      </ul>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'));
  const logout = () => { localStorage.clear(); setAuthed(false); };
  return authed ? <Tasks onLogout={logout} /> : <Auth onAuth={() => setAuthed(true)} />;
}
