# Post-development Checklist & Notes

Use this checklist after you finish developing and want to prepare the system for production or sharing.

## Quick dev notes
- During local development it's OK to keep the Supabase `uploads` bucket **public** so uploads and previews work without signed URLs.
- Keep `backend/.env` local and DO NOT commit it. Use `backend/.env.example` as the template.

## Immediately before deploying / sharing repository
- Remove or exclude any local `.env` files. Ensure `.gitignore` contains `.env`.
- Replace any test secrets in files with placeholders (use `.env.example`).
- Run database migrations / apply `db/schema.sql` to the production DB.
- Seed an admin account (see `backend/scripts/create_admin.js`).

## Supabase / Storage (important)
- Create a Supabase project and a `uploads` bucket.
- In development you may leave `uploads` public; for production change to **private**.
- For production: switch backend `SUPABASE_KEY` to the **service_role** key (backend only) and store it in your host's secret store.
- For private buckets: implement server-side signed URLs (short expiry) to serve files.

## Security hardening (post-dev)
- Set a strong `JWT_SECRET` in production environment variables.
- Enforce auth on all write endpoints (POST/PUT/DELETE) and use role checks where appropriate.
- Limit file types and sizes (already set: images + PDFs, 10MB). Adjust if needed.
- Consider virus/malware scanning for uploaded files before saving to storage.
- Rotate Supabase keys if they are ever exposed.

## Deployment checklist (Railway / Render / Vercel example)
- Backend (Railway/Render): set `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_KEY` (service_role), `SUPABASE_BUCKET`, `FRONTEND_URL` in project secrets.
- Frontend (Vercel): set `VITE_API_BASE` to backend URL. Use anon key only in client if you need direct client uploads (prefer backend uploads).
- Ensure CORS allows your frontend origin (`FRONTEND_URL`).
- Add monitoring / logging (Sentry, Papertrail) and error reporting for production.

## Testing after deploy
- Test user login and role-restricted endpoints.
- Create a defect and upload files; confirm they appear and are accessible (signed URL or public URL depending on setup).
- Test invalid uploads (wrong type, oversize) to confirm server rejects them.

## Ops & backups
- Enable automated DB backups (Supabase/managed DB). Test restore process occasionally.
- Configure access control for the Supabase project: limit who can view service_role keys.

## Optional improvements (later)
- Add signed-url endpoint and make bucket private.
- Add attachment listing endpoint and frontend defect detail page.
- Add attachment deletion endpoint with server-side cleanup in Supabase.
- Add CI to run lint/tests and deploy to staging on push.

---
Keep this file as a reminder of post-development tasks and security steps. Ask me to implement any checklist item for you.
