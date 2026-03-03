# Active Context: GradCall – Academic Admissions Cloud

## Current State

**Project Status**: ✅ GradCall platform fully implemented

GradCall is a complete academic admissions platform for managing postgraduate program calls (convocatorias). Built on Next.js 16 with full-stack capabilities.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] **GradCall full platform implementation**
  - [x] Database schema: users, universities, programs, applications, documents, notifications, status_history
  - [x] JWT authentication with bcrypt (3 roles: super_admin, university, aspirant)
  - [x] API routes: auth, programs CRUD, applications CRUD, notifications, CSV export
  - [x] Super Admin dashboard (approve/reject programs, manage users)
  - [x] University dashboard (create convocatorias, review applications)
  - [x] Aspirant dashboard (browse programs, 6-section application form)
  - [x] Application status workflow (7 states with history tracking)
  - [x] Notifications system
  - [x] CSV export for applications
  - [x] Public programs listing with search/filters
  - [x] Drizzle ORM + SQLite migrations

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Landing page | ✅ Ready |
| `src/app/layout.tsx` | Root layout | ✅ Ready |
| `src/app/globals.css` | Global styles + custom CSS | ✅ Ready |
| `src/app/login/page.tsx` | Login page | ✅ Ready |
| `src/app/register/page.tsx` | Register page (aspirant/university) | ✅ Ready |
| `src/app/programs/page.tsx` | Public programs listing | ✅ Ready |
| `src/app/programs/[id]/page.tsx` | Program detail + apply | ✅ Ready |
| `src/app/dashboard/page.tsx` | Aspirant dashboard | ✅ Ready |
| `src/app/dashboard/applications/[id]/page.tsx` | 6-section application form | ✅ Ready |
| `src/app/university/page.tsx` | University dashboard | ✅ Ready |
| `src/app/university/programs/new/page.tsx` | Create convocatoria form | ✅ Ready |
| `src/app/university/applications/[id]/page.tsx` | Review application | ✅ Ready |
| `src/app/admin/page.tsx` | Super Admin dashboard | ✅ Ready |
| `src/db/schema.ts` | Database schema (7 tables) | ✅ Ready |
| `src/db/index.ts` | Database client | ✅ Ready |
| `src/lib/auth.ts` | JWT + bcrypt auth utilities | ✅ Ready |
| `src/app/api/` | All API routes | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Application Architecture

### Roles
- **Super Admin**: Approves/rejects programs, manages all users and data
- **University**: Creates convocatorias, reviews applications, changes status
- **Aspirant**: Browses programs, submits applications, tracks status

### Program Status Flow
`draft` → `pending_approval` → `published` → `closed`

### Application Status Flow
`draft` → `submitted` → `under_review` → `interview` → `approved`/`rejected`/`waitlisted`

### Key URLs
- `/` - Landing page
- `/programs` - Public program listing
- `/programs/[id]` - Program detail
- `/login` - Login
- `/register` - Register (aspirant or university)
- `/dashboard` - Aspirant dashboard
- `/dashboard/applications/[id]` - Application form (6 sections)
- `/university` - University dashboard
- `/university/programs/new` - Create convocatoria
- `/university/applications/[id]` - Review application
- `/admin` - Super Admin dashboard
- `/api/admin/seed` - Create initial super admin (POST)

### Initial Setup
1. Visit `/api/admin/seed` (POST) to create super admin
2. Login with `admin@gradcall.com` / `Admin123!`

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2024 | GradCall full platform implemented - complete academic admissions system |
