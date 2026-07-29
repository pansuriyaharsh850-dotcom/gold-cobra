# Gold Cobra — project export

## What's in here
Everything from your pasted code, plus the CRUD + role work done in chat.

- `backend/` — Express API, unchanged except:
  - `middleware/authMiddleware.js` — added `requireAdmin`
  - `routes/*.js` — every POST/PUT/DELETE route (bom, materials, milestones,
    roads, wards, dashboard update) now requires `verifyToken` + `requireAdmin`.
    GET routes are still public, same as before.
  - `.env.example` — template only. Your real `.env` was pasted in chat
    earlier, so treat that DB password and JWT secret as compromised —
    **rotate them in Neon and generate a new JWT_SECRET before deploying this.**

- `frontend/` — React app, with:
  - `api/client.js` — shared axios client, attaches the saved JWT to every
    request via an interceptor.
  - `App.jsx` — real login (calls `/api/auth/login`), stores `role` from the
    response, derives `canEdit = role === "admin"`.
  - `components/BomTable.jsx`, `MilestoneTable.jsx` — Add/Edit/Delete UI,
    hidden entirely when `canEdit` is false.
  - `components/MaterialsTable.jsx` — new, same pattern (Materials had no UI
    at all before).
  - `components/CrudModal.jsx` — shared add/edit form used by the three above.

## NOT included (you never pasted these)
- `frontend/src/components/Login.jsx`
- `frontend/src/components/MapPanel.jsx`

Your project won't build without them — copy your existing versions back in
at those paths. `Login.jsx` should accept the props `username`, `password`,
`setUsername`, `setPassword`, `onLogin`, `error`, `loading` (the last two are
new — optional, but showing `error` will surface failed-login messages).

## To make admin vs. client actually work
1. In your `users` table, make sure the `role` column has real values —
   `admin` for staff, anything else (`client`, `viewer`, etc.) for read-only
   accounts. If your role value for admins isn't literally `"admin"`, update
   the `ADMIN_ROLE` constant near the top of `frontend/src/App.jsx` and the
   `req.user.role !== "admin"` check in `backend/middleware/authMiddleware.js`
   to match.
2. Passwords are still stored and compared in plain text in
   `authController.js` — flagged, not fixed. Say the word if you want
   `bcrypt` wired in.

## Steps to run
```
cd backend && npm install && npm start
cd frontend && npm install && npm run dev
```
