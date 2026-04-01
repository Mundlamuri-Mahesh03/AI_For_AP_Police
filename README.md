# AIforappolice

## Overview
This project implements a police unit hierarchy management app with:
- **Backend**: Express + Prisma + MySQL + JWT auth.
- **Frontend**: React + Vite + Redux Toolkit + RTK Query.

The app supports:
- hierarchical police unit CRUD
- tree display with nested parent/child units
- login/auth by role (ADMIN/OFFICER)
- unit scope-based data visibility
- import seed data from TSV-like hierarchy table

---

## Backend (apps/backend)

### Folder structure
- `package.json` - backend dependencies and scripts
- `src/app.js` - express app setup, middleware, router mount
- `src/server.js` - server startup
- `src/lib/prisma.js` - Prisma client instantiation with compatibility for Prisma v6
- `src/middleware/auth.js` - JWT bearer check, role & user payload
- `src/middleware/accessScope.js` - unit scope enforcement
- `src/middleware/authorizeRole.js` - role gating by endpoints
- `src/middleware/errorHandler.js` - generic error formatting
- `src/modules/auth` - login controller/service (bcrypt, token creation)
- `src/modules/policeUnit` - CRUD + tree + unit-scope repository/service/controller
- `src/modules/users` - user APIs
- `src/routes/index.js` - routes mounting, debug routes
- `prisma/schema.prisma` - database model definitions for `User`, `PoliceUnit`
- `prisma/seed-police-hierarchy.js` - idempotent seeding of units + admin user

### Key flow
1. Start server: `npm run dev` (or `node src/server.js`).
2. `POST /api/auth/login` -> validate `email/password`, returns `token`.
3. Protected routes require `Authorization: Bearer <token>`.
4. `GET /api/police-units/tree` returns top-level tree (role/scoped user filtering).
5. `GET /api/me/unit-scope` returns current user scope. used in frontend.
6. Unit operations: `POST /api/police-units`, `PUT /api/police-units/:id`, `DELETE /api/police-units/:id`.

### Database
- `DATABASE_URL` in `.env` (MySQL).
- `npx prisma migrate dev --name init` to create schema.
- `npx prisma db push` / `npx prisma migrate` for schema updates.
- `node prisma/seed-police-hierarchy.js` to import data idempotently.

### Seed script behavior
- Parses hardcoded TSV data block into units.
- `upsert` by `code`, avoids duplicates.
- sets parent relations after all units are upserted.
- ensures admin user exists as role `ADMIN` at `DGP(HOPF)`.

---

## Frontend (apps/frontend)

### Folder structure
- `package.json` - dependencies and scripts
- `vite.config.js` - Vite config
- `index.html`
- `src/main.jsx` - render app and provider setup
- `src/App.jsx` - high-level page routing
- `src/pages/LoginPage.jsx` - login with RTK query
- `src/pages/HierarchyPage.jsx` - tree UI + forms + modal logic
- `src/components/HierarchyTree.jsx` - recursive tree nodes
- `src/components/UnitFormModal.jsx` - modal for create/edit
- `src/context/AuthContext.jsx` - auth state, token in localStorage
- `src/services/api.js` - base axios instance (if used)
- `src/redux/store.js` - Redux store with RTK Query middleware
- `src/redux/slices/apiSlice.js` - `createApi` definitions
- `src/redux/slices/authSlice.js` - auth slice state + actions
- `src/redux/slices/policeUnitSlice.js` - police units endpoints + mutations
- `src/styles.css` - UI theme and style rules

### Key flow
1. Start frontend: `npm run dev` from `apps/frontend`.
2. Login UI calls `useLoginMutation` from RTK Query.
3. On success, token saved to `localStorage`; user stored globally.
4. `HierarchyPage` uses `getScope` and `getTree` queries.
5. Create/update/delete actions go through RTK Query mutation endpoints.
6. Tree UI uses recursive `HierarchyTree` component and icons.

### Feature behavior - unit operations

#### Add Root Unit
- click "Add Root Unit" in header.
- `openCreate(null)` sets `mode='create'` and `selectedUnit=null`.
- modal opens with blank fields; parent remains unset.
- submit calls `createUnit` mutation with provided values.
- backend `POST /api/police-units` creates brand-new unit with `parentId=null`.
- tree query refetch shows new root node.

#### Create Child Unit
- click + icon on any unit row (in `HierarchyTree`).
- `openCreate(unit)` sets `mode='create'` and `selectedUnit={ parentId: unit.id }`.
- modal preselects parent via `possibleParents` filter.
- submit sends `parentId` to backend.
- new child is linked under parent in tree.

#### Edit Unit
- click edit icon on a unit row.
- `openEdit(unit)` sets `mode='edit'` and `selectedUnit` to unit object.
- modal form is pre-filled with existing values.
- when saved, `updateUnit({ id, ...payload })` calls `PUT /api/police-units/:id`.
- response updates unit record using API and refreshes tree.

#### Delete Unit
- click trash icon on a unit row.
- confirmation prompt (`window.confirm`).
- on yes, `deleteUnit(unit.id).unwrap()` triggers `DELETE /api/police-units/:id`.
- backend removes unit; children may remain or be dissociated depending service logic.
- after success, tree UI refreshes and message shows "Deleted successfully".

### Styling notes
- Modern card layout set in `styles.css`
- `icon-btn` square style for tree action buttons
- Search + filter + status messages in card area.

---

## Build & Run

Backend
- `cd apps/backend`
- `npm install`
- `npm run dev`

Frontend
- `cd apps/frontend`
- `npm install`
- `npm run dev`

---

## Troubleshooting
- `401 Unauthorized` means token invalid/expired or `jwtSecret` mismatch.
- `Cannot find module '.prisma/client/default'` means Prisma generate mismatch (use Prisma v6 pattern or reinstall with `npx prisma generate`).
- DB not found -> run `npm run migrate` and ensure `DATABASE_URL` valid.

---

## Extend and customize
- Convert unit CSV/Excel import to API endpoint for upload.
- Add audit logging to unit modifications.
- Add nested tree drag/drop ordering in frontend.
