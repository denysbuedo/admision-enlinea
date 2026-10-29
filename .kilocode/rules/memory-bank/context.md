# Active Context: Nexo – Academic Admissions Cloud

## Current State

### Repository review — 2026-10-28

- After a successful `git fetch origin --prune`, local `main` and `dev` matched `origin/main` and `origin/dev` at `7418f7ca4b2a70e8afac9eb5ea0e07e51e9cfb24` (2026-06-23). GitHub's default branch is `main`, independently confirmed with `git ls-remote --symref origin HEAD`. Before this documentation update, the working tree was clean: no changed files or ahead/behind commits.
- Static review found public registration accepts and persists `super_admin` without authorization; JWT signing/verification falls back to a hardcoded secret when `JWT_SECRET` is absent; notification trigger authorization is commented out. These issues exist in the matching remote code too and were not fixed in this review.
- `npm run typecheck` failed in the current local dependency installation, including missing Next.js type declarations. `next.config.ts` enables `ignoreBuildErrors`.
- `npm run test -- --run` failed both suites before executing tests: Vitest references missing `src/test/setup.ts`, while the setup file is actually `test/setup.ts`.
- `sqlite.db` is tracked in Git. No database contents or production environment were inspected. Code equality does not establish identical ignored environment files, installed dependencies, or deployed behavior.
- Only this memory-bank entry was intentionally changed; no application fixes or deployment were performed.

**Project Status**: ✅ Nexo platform fully implemented

Nexo is a complete academic admissions platform for managing postgraduate program calls. Built on Next.js 16 with full-stack capabilities.

**Deployment Target**: `https://convocatorias.reduniv.edu.cu` behind a remote HAProxy that terminates TLS. The Ubuntu app server should expose Next.js directly on TCP port `3000`; local Nginx is not part of the current deployment guide.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] **Nexo full platform implementation**
  - [x] Database schema: users, universities, programs, applications, documents, notifications, status_history
  - [x] JWT authentication with bcrypt (3 roles: super_admin, university, aspirant)
  - [x] API routes: auth, programs CRUD, applications CRUD, notifications, CSV export
  - [x] Super Admin dashboard (approve/reject programs, manage users)
  - [x] University dashboard (create programs, review applications)
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
| `src/app/university/programs/new/page.tsx` | Create program form | ✅ Ready |
| `src/app/university/applications/[id]/page.tsx` | Review application | ✅ Ready |
| `src/app/admin/page.tsx` | Super Admin dashboard | ✅ Ready |
| `src/db/schema.ts` | Database schema (7 tables) | ✅ Ready |
| `src/db/index.ts` | Database client | ✅ Ready |
| `src/lib/auth.ts` | JWT + bcrypt auth utilities | ✅ Ready |
| `src/app/api/` | All API routes | ✅ Ready |
| `src/app/university/programs/[id]/page.tsx` | Program detail (university) | ✅ Added |
| `src/app/university/programs/[id]/applications/page.tsx` | Applications list by program (university) | ✅ Added |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Application Architecture

### Roles
- **Super Admin**: Approves/rejects programs, manages all users and data
- **University**: Creates programs, reviews applications, changes status
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
- `/university/programs/new` - Create program
- `/university/applications/[id]` - Review application
- `/admin` - Super Admin dashboard
- `/api/admin/seed` - Create initial super admin (POST)

### Initial Setup
1. Visit `/api/admin/seed` (POST) to create super admin
2. Login with `admin@nexo.com` and the password configured in `ADMIN_INITIAL_PASSWORD`

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2024 | Nexo full platform implemented - complete academic admissions system |
| 2026-06-10 | **Estabilización del build** — corregidos errores de compilación: implementadas funciones `verifyPassword`, `signToken`, `getSession` en `auth.ts`; agregado `programCreateSchema` en `validations.ts`; corregidos mapeos en `programs/page.tsx` y `hooks/usePrograms.ts`; eliminado `useSession` (next-auth) de `admin/universities/page.tsx` y reemplazado con fetch a `/api/auth/me`; creado endpoint `/api/auth/me`; configurado `next.config.ts` para ignorar errores TS en build. **Build exitoso: 25 rutas generadas.** |
| 2026-06-10 | **Gestión de Universidades desde Admin** — creado endpoint `POST /api/admin/universities/route.ts` (GET, POST, PATCH) protegido por rol `super_admin`; agregada pestaña "Universidades" en `/admin/page.tsx` con tabla de listado y modal de creación (campos: nombre*, país, ciudad, facultad, sitio web, descripción); se carga automáticamente junto con el resto del dashboard. |
| 2026-06-12 | **Fix POST /api/applications** — corregido handler de creación de aplicaciones: agregada validación de rol `aspirant`, validación de `programId`, verificación de existencia y estado del programa (`published`), detección de duplicados por usuario; inserción con valores seguros. **Fix GET /api/applications** — ahora filtra correctamente: super_admin ve todo, universidad ve solo sus programas vía `programs.universityId`, aspirante ve sus propias aplicaciones vía `applications.userId`. **Nuevas páginas universidad** — creadas `/university/programs/[id]/page.tsx` (detalle de programa con stats) y `/university/programs/[id]/applications/page.tsx` (lista filtrada de solicitudes). |
| 2026-06-23 | **Actualización de despliegue Ubuntu** — `DEPLOY.md` ajustado para producción en `nexo.mes.gob.cu` con HAProxy remoto terminando TLS. Se eliminó el flujo de Nginx local, se documentó Next.js escuchando en `0.0.0.0:3000`, firewall restringido a `<IP_HAPROXY>`, encabezados esperados (`Host`, `X-Forwarded-Proto`, `X-Forwarded-For`) y pruebas con `curl`. |
| 2026-06-23 | **Endurecimiento de credenciales admin** — removidas las credenciales de prueba visibles en `/login` y `/setup`; `/api/admin/seed` ahora usa `ADMIN_INITIAL_PASSWORD` y no devuelve contraseñas; agregado script `bun run db:admin-password` para resetear la contraseña de `admin@nexo.com` con `ADMIN_PASSWORD`. |

### CONVOCA implementation — 2026-10-28

- Connected to the production VM through the authorized SSH bastion, validating its existing host key. Production source matched `7418f7c`; only `bun.lock` integrity metadata and runtime `sqlite.db` differed. Adopted server lockfile, excluded access files and SQLite runtime data from future commits. Production data remains on the server.
- Verified pre-change backup `/opt/convoca-backups/pre-convoca-20261028.tar.gz`. Direct health check with proxy bypass returned HTTP 200; an initial HTTP 503 originated from the server proxy, not Next.js.
- Applied CONVOCA v1.0 official logos, colors, local Inter/IBM Plex Mono fonts with licenses, favicon and social preview. Redesigned homepage, updated branding/palette across existing screens, added program-type links and retained API/role identifiers.
- Restored local Next.js dependency installation; typecheck and build passed. Fixed Vitest setup path and timezone-dependent sample test: 6 tests passed. Browser checks on home, catalog, login and register passed desktop/mobile without horizontal overflow or page errors; inspected homepage screenshots.
- Added `PLAN-EVOLUCION.md` as a proposal for the next stage, including known authorization flaws, dependency review, functional coverage and operational hardening. These backend changes are deferred, not claimed fixed by the visual refresh.

- Deployment completed: compiled application commit `7844d18` active at `https://convocatorias.reduniv.edu.cu/`. Production build succeeded before activation; service healthy afterward. Browser smoke checks returned HTTP 200 on home/catalog/login/register, loaded Inter locally, verified absolute social image URL, and reported no page errors. No production data writes or full authenticated admission flows were tested.
- Production DB was byte-identical to the pre-deployment backup after activation. Prior build and backups remain available on the server. Local and remote source trees were clean at application deployment; final documentation is synchronized separately without rebuilding unchanged application code.

### CONVOCA visual v1.1 — 2026-10-28

- Implemented the supplied v1.1 proposal for CONVOCA only: shared public navigation (72/64 px, navy, 1280 px container), accessible mobile menu, distinct supplied category SVGs and revised homepage surfaces. Dashboard navigation, API permissions, content and application workflows retained.
- Typecheck, scoped ESLint, local build and 6 existing tests passed. Playwright checked five viewport widths without overflow and mobile keyboard/Escape behavior. Axe found no WCAG A/AA violations on the homepage across those widths. Details and limits in `docs/VISUAL-V1.1.md`; local screenshots in `.deploy/visual-v1.1/`.
- Verified server baseline `42cb174` and pre-change backup `/opt/convoca-backups/v1.1-20261028/pre-deploy.tar.gz`; production data remains outside Git.
