# Web Tech — Educational Portal

A full-stack **learning management–style demo** for university-style courses: **students** enroll and complete modules with quizzes, **instructors** build courses and rosters, and **admins** manage the catalog and bookstore inventory. The UI is mostly **static HTML/CSS/JS** under role-specific folders; **Express** serves the files and exposes a **JSON API**. **PostgreSQL** holds all data (designed to work well with **Supabase** direct connections).

This repository is suitable for coursework on web technology: HTTP APIs, cookies/sessions, SQL-backed auth, and multi-role UX.

---

## What’s included

| Area | Details |
|------|--------|
| **Auth** | Register/login against `public.users` (bcrypt via Postgres `crypt`). Signed **HMAC** cookie (`portal_session`) using `PORTAL_SESSION_SECRET`. Logins are restricted to emails ending in `@student.uts.edu.my` or `@uts.edu.my` (demo policy). |
| **Courses** | Catalog, public overviews, learning views with modules (notes, sample file metadata, video URLs), MCQ quizzes, module completion and enrollment progress. |
| **Instructor** | CRUD-style course editor, rosters, add/remove members, sample file listings from repo assets. |
| **Admin** | Course catalog oversight, instructor listing, bookstore inventory and stats. |
| **Bookstore** | Browse titles, checkout (logged-in), personal library and purchase history; catalog backed by JSON seed + DB. |

Static entry points live under `landing/`, `student/`, `instructor/`, and `admin/`. Shared assets include `assets/` and `shared/`.

---

## Tech stack

- **Runtime:** Node.js (CommonJS)
- **Server:** Express 5
- **Database:** PostgreSQL (`pg`), schema in `supabase/migrations/`
- **Config:** `dotenv` → `.env` at repo root

No React/Vue build step—the app is **server + static pages** that call `/api/*`.

---

## Prerequisites

1. **[Node.js](https://nodejs.org/)** (current LTS recommended), npm on your `PATH`.
2. **PostgreSQL** database you can connect to with a **single connection URI** (e.g. Supabase **Project Settings → Database → URI** / “Direct connection”).  
   - The app enables TLS for Supabase-style hosts (`*.supabase.co`, `pooler.supabase.com`) by default.

---

## Quick start (Windows)

1. Clone or copy this repository and open a terminal in the project root.
2. Run **`first-setup.bat`**:
   - Installs npm dependencies if `node_modules` is missing.
   - Runs `node scripts/setup-new-database.js --first-setup`:
     - Uses `DATABASE_URL` from `.env` if present; otherwise prompts once for the URI.
     - Generates a random **`PORTAL_SESSION_SECRET`** and writes/updates `.env`.
     - Applies SQL migrations, then runs the full demo seed (users → bookstore → courses).
   - Starts the app with **`npm start`** (default port **3000**).

3. Open **http://localhost:3000** and use the landing/login flow or go directly to **`/landing/landing/login.html`**.

---

## Quick start (macOS / Linux or manual)

```bash
cd /path/to/Web-Tech
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL and PORTAL_SESSION_SECRET (≥16 chars, or use a long random hex string)
npm run migrate
npm run seed
npm start
```

**First-time automation (same as batch `first-setup`):**

```bash
node scripts/setup-new-database.js --first-setup
npm start
```

For an **interactive** wizard (prompts for migrate/seed and optional demo password), run:

```bash
npm run setup:db:new
# or: node scripts/setup-new-database.js
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection URI (`postgresql://...`). Used by the server and all scripts. |
| `PORTAL_SESSION_SECRET` | Yes | Secret for signing the portal session cookie (min 16 chars in interactive setup; `--first-setup` generates 64 hex chars). |
| `PORT` | No | HTTP port (default **3000**). |
| `SEED_USER_PASSWORD` | No | Plain password applied to **demo** seeded users (default **`123456`** if unset). |
| `DATABASE_SSL` | No | Set to `true` to force SSL for non-Supabase hosts. |
| `SESSION_SECRET` | No | Optional alias name in examples only; the code path uses **`PORTAL_SESSION_SECRET`**. |

Copy **`.env.example`** to **`.env`** and adjust. Never commit real secrets.

---

## NPM scripts

| Script | Purpose |
|--------|---------|
| `npm start` | Run `node server/index.js` (API + static files). |
| `npm run migrate` | Apply pending SQL from `supabase/migrations/` (tracked in `public.web_tech_migration_history`). |
| `npm run migrate -- --dry-run` | List pending migrations without applying. |
| `npm run migrate -- --baseline` | Mark all migration files as applied without running SQL (use only when DB already matches). |
| `npm run seed-users` | Upsert demo portal users into `public.users`. |
| `npm run seed-bookstore` | Load `supabase/seed-data/bookstore-catalog.json` (+ optional demo purchases). |
| `npm run seed-courses` | Idempotent demo courses, modules, quizzes, enrollments, sample progress. |
| `npm run seed` | All three seeds in order (**users → bookstore → courses**). |
| `npm run setup:db` | `migrate` then `seed`. |
| `npm run setup:db:new` | Interactive `setup-new-database.js` (merge `.env`, optional migrate/seed flags). |

Setup CLI flags (non–first-setup): `--migrate`, `--no-migrate`, `--seed`, `--no-seed`. **`--first-setup`** forces migrate + seed and auto-generates the session secret.

---

## Demo accounts (after seed)

Seeded users are defined in `scripts/seed-demo-users.js` (and optional extras in `supabase/seed-data/demo-portal-users.json`). Typical accounts:

| Email | Role | Notes |
|-------|------|--------|
| `ali@student.uts.edu.my` | student | Demo student ID `UTS20230001`; sample course progress on “Web Technology”. |
| `instructor@uts.edu.my` | instructor | Owns seeded courses. |
| `admin@uts.edu.my` | admin | Admin dashboards. |

**Password:** value of `SEED_USER_PASSWORD`, or **`123456`** by default.

---
## Important note:

The course materials options are in the /assets/sample-files

---

## Project layout (high level)

```
Web-Tech/
├── server/           # Express app (index.js), db access, courses repo, session helpers
├── landing/          # Public landing + login/registration HTML
├── student/          # Student dashboard, courses, bookstore, quizzes
├── instructor/       # Instructor dashboard, course editor, roster
├── admin/            # Admin dashboard, catalog, bookstore admin
├── assets/           # Shared JS/CSS; sample files for courses
├── shared/           # Shared front-end utilities
├── scripts/          # migrate-db.js, setup-new-database.js, seed-* scripts
├── supabase/
│   ├── migrations/   # Ordered *.sql schema migrations
│   └── seed-data/    # JSON for bookstore, optional demo users/purchases
├── first-setup.bat   # Windows one-shot install + DB setup + start
├── .env.example      # Template environment file
└── package.json
```

---

## API overview

All JSON routes are under **`/api/`**. Examples:

- **Auth:** `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/session`, `GET|POST /api/auth/logout`, `POST /api/auth/password`
- **Courses:** `GET /api/courses/catalog`, `GET /api/courses/:courseId/overview`, `GET …/learn`, quiz `GET/POST`, module completion
- **Student:** enrolled courses, enroll
- **Instructor:** courses CRUD, edit payload, roster, members
- **Admin:** courses list/edit, instructors, bookstore admin
- **Bookstore:** books, detail, checkout, my-library, purchase-history

**Health:** `GET /api/health`  
**Root:** `GET /` redirects to a default landing path.

Full route list: see `server/index.js` (search for `app.get`, `app.post`).

---

## Database and seeds

- **Migrations:** Versioned `*.sql` files in `supabase/migrations/`. Applied in filename order; each file runs once.
- **Seeds:**
  - **Users** — `scripts/seed-demo-users.js`
  - **Bookstore** — `supabase/seed-data/bookstore-catalog.json` (+ optional `bookstore-purchases.demo.json`)
  - **Courses** — inline demo curriculum in `scripts/seed-courses-data.js` (many courses/modules/quizzes; enrolls all students in all **published** courses)

Seeds are **idempotent** (safe to re-run). Course seed logs each step (courses, enrollments, demo completions).

To export a bookstore catalog JSON from an existing DB (maintenance):

```bash
node scripts/export-bookstore-catalog-json.js > supabase/seed-data/bookstore-catalog.json
```

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| **Cannot connect to DB** | Verify `DATABASE_URL`, firewall, and Supabase “direct” vs “pooler” URI. Ensure the DB is reachable from your machine. |
| **SSL errors** | Supabase URLs are detected automatically. For other hosts, set `DATABASE_SSL=true`. |
| **Login always fails** | Confirm migrations and `seed-users` ran; password matches `SEED_USER_PASSWORD` or default. Email must match `@student.uts.edu.my` or `@uts.edu.my`. |
| **Empty course/bookstore** | Run `npm run migrate` then `npm run seed` (order matters: users before courses/bookstore purchases). |
| **Port in use** | Set `PORT` in `.env` to another value (e.g. `3001`). |

---

## License

ISC (see `package.json`).

---

## Contributing / coursework

When adding features, keep **SQL changes** in new files under `supabase/migrations/`, and extend seeds or documentation so a fresh `migrate` + `seed` still produces a usable demo.
