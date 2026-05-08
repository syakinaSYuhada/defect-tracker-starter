# Defect & Corrective Action Tracker — Starter

Minimal starter scaffold for a Defect & Corrective Action Tracking System.

Contents
- `backend/` — Express API with PostgreSQL (entry: `server.js`, app: `src/app.js`)
- `frontend/` — minimal React + Vite starter
- `db/schema.sql` — SQL schema to initialize the database
- `docker-compose.yml` — local dev stack (Postgres + backend)

Prerequisites
- Node.js 18+, npm
- PostgreSQL (or Docker)
- Optional: Docker & Docker Compose for containerized dev

Quick start (Docker, recommended)

```bash
git clone <your-repo>    # or copy this starter folder
cd defect-tracker-starter
docker compose up --build

# Backend will be reachable at http://localhost:3000
# Frontend dev server (if run via Docker) at http://localhost:5173
```
# Defect & Corrective Action Tracker — Starter

Minimal starter scaffold for a Defect & Corrective Action Tracking System.

Initialize the database (manual, without Docker)

1. Create database and user (psql):

```bash
# connect as postgres user or a superuser
psql -U postgres
\nCREATE USER defecttracker WITH PASSWORD 'defecttracker';
CREATE DATABASE defecttracker OWNER defecttracker;
\q
```

2. Apply schema:

```bash
psql -U defecttracker -d defecttracker -f db/schema.sql
```

3. Seed admin account (uses `backend/scripts/create_admin.js`):

```bash
cd backend
cp .env.example .env   # set ADMIN_EMAIL/ADMIN_PASSWORD if desired
npm install
node scripts/create_admin.js
```

Running locally without Docker

Backend:

```bash
cd backend
cp .env.example .env
# edit .env and set DATABASE_URL to your local Postgres
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Sample environment variables

backend/.env (example values)

```
# PostgreSQL connection string
DATABASE_URL=postgres://defecttracker:defecttracker@localhost:5432/defecttracker
PORT=3000
NODE_ENV=development
JWT_SECRET=change_this_to_a_strong_secret

# Admin seed (optional)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=adminpass
```

If using Docker Compose the service environment is already configured in `docker-compose.yml` (it uses `postgres://defecttracker:defecttracker@db:5432/defecttracker`).

Notes & tips
- `db/schema.sql` contains core tables for users, defects, corrective actions, attachments, and activity logs.
- Use a managed DB (Supabase, Neon) in production to avoid operating a Postgres server yourself.
- Keep `.env` out of git; `.gitignore` already excludes it.
- For production, set a secure `JWT_SECRET`, run behind `nginx` with TLS, and use persistent storage for `uploads/`.

Where to go next
- See `docs/api.md` for available endpoints and examples.
- I can generate a `docker-compose.override.yml` with nginx + TLS, or scaffold frontend pages (Login, Dashboard, DefectList, DefectForm).

Deploy guide (Vercel + Railway/Render + Supabase)

1) Push repo to GitHub (frontend and backend are subfolders)

2) Supabase (Postgres)
- Create a new project and note the `Database URL` / `connection string`.
- In the SQL editor paste the contents of `db/schema.sql` and run it to create tables.

3) Railway / Render (Backend)
- Create new service and connect your GitHub repo; set the root to `/backend`.
- Build command: `npm install` (or let the platform run install automatically). Start command: `npm start`.
- Add environment variables in the Railway/Render dashboard:
	- `DATABASE_URL` = your Supabase Postgres connection string
	- `JWT_SECRET` = a long random secret
	- `FRONTEND_URL` = your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
	- (optional) `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_BUCKET` if using Supabase Storage

4) Vercel (Frontend)
- Import the repo and set the Root Directory to `/frontend`.
- Add Environment Variable in Vercel:
	- `VITE_API_BASE` = your backend base URL (e.g. `https://your-backend.up.railway.app`)
- Build command: `npm run build` (Vercel auto detects)

5) Seed admin user
- In Railway/Render you can run a one-off command or use a console to execute:
	```bash
	node scripts/create_admin.js
	```
	Make sure `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` are set in the environment.

6) Storage for uploads
- In production do NOT rely on the backend filesystem. Use Supabase Storage or S3. Configure storage credentials in backend env and update upload code accordingly.

Notes
- Set `FRONTEND_URL` and `VITE_API_BASE` to the deployed production URLs to avoid CORS issues.
- Backend `FRONTEND_URL` is used to allow CORS from your frontend; the starter also allows `http://localhost:5173` for local dev.
- If you need, I can: update backend to upload to Supabase, add Vercel redirect rules, or prepare a Railway deploy checklist with exact UI steps.

Happy building!
