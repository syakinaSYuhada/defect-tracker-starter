# API Reference — Defect Tracker Starter

Base URL: `/` (backend root)
Auth: JWT in `Authorization: Bearer <token>` header

## Health
- GET `/health`
- Response: `{ ok: true, time: "..." }`

## Auth
- POST `/api/auth/login`
  - Body: `{ "email": "user@example.com", "password": "secret" }`
  - Response: `{ "token": "...", "user": { id, email, role } }`

- POST `/api/auth/register`
  - Body: `{ "name": "User", "email": "u@x.com", "password": "pass", "role": "operator" }`
  - Response: `201 { id, email, role }` (admin-only in production)

## Defects
- GET `/api/defects`
  - Query: `production_line_id`, `defect_type_id`, `status`, `limit`, `offset`
  - Response: `[{ id, production_line_id, defect_type_id, batch_number, reported_by, description, severity, status, created_at }, ...]`

- POST `/api/defects`
  - Body (JSON): `{ "production_line_id":1, "defect_type_id":2, "batch_number":"B123", "description":"...", "severity":"high" }`
  - Response: `201 { ...created defect... }`
  - Notes: to upload photos use `/api/uploads` or multipart handler (not implemented in starter)

- GET `/api/defects/:id`
  - Response: defect object with related attachments and actions (if implemented)

- PUT `/api/defects/:id`
  - Body: fields to update (status, description, severity)

## Corrective Actions
- GET `/api/actions`
- POST `/api/actions`
  - Body: `{ "defect_id":1, "assigned_to":2, "description":"Fix seal", "due_date":"2026-06-01" }`
  - Response: `201 { ... }`

- PUT `/api/actions/:id`
  - Body: `{ "status":"completed", "completed_at":"..." }`

## Uploads (concept)
- POST `/api/uploads`
  - Content-Type: `multipart/form-data` with `file` field
  - Response: `{ "filename":"img.jpg", "path":"uploads/photos/img.jpg", "url":"/uploads/photos/img.jpg" }`
  - Security: validate file types and size in production

## Users (admin)
- GET `/api/users`
- GET `/api/users/:id`
- PUT `/api/users/:id`
  - Body: `{ "name":"...", "role":"supervisor" }`

## Dashboard
- GET `/api/dashboard/summary`
  - Response: `{ counts: { open: 10, overdue: 2, completed: 50 }, trends: { byType: [...], byLine: [...] } }`

---

### Quick curl examples
Login and use token:

```bash
curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"adminpass"}'
# returns token
TOKEN=... 
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/defects
```

Create a defect (JSON):

```bash
curl -X POST http://localhost:3000/api/defects -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"production_line_id":1,"defect_type_id":1,"batch_number":"B01","description":"Cracked cap","severity":"high"}'
```

Notes:
- All endpoints in starter are minimal and may need expansion (validation, pagination, relations).
- Protect admin routes and add role checks for production.
