# MERN Task Manager

Full-stack task manager: user accounts (JWT + bcrypt), per-user tasks with status, priority,
due date, search and filtering.

**Stack:** MongoDB + Mongoose, Express.js, React (Vite), Node.js, REST APIs.

## Run
```bash
# Terminal 1 - API
cd server && cp .env.example .env && npm install && npm run dev
# Terminal 2 - UI
cd client && npm install && npm run dev      # http://localhost:5173
```
Requires MongoDB running locally (or set `MONGO_URI` to MongoDB Atlas).

## API
`POST /api/auth/register|login` · `GET/POST /api/tasks` · `PUT/DELETE /api/tasks/:id`
(all task routes need `Authorization: Bearer <token>`)
