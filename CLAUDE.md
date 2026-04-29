# CLAUDE.md — profiles-ops

This file is the primary reference for AI assistants (Claude) working in this repository. Read it before making any changes.

## Project Overview

**profiles-ops** is an AI-powered resume tailoring and job application tracking service.

Core capabilities:
1. **Profile Store** — each profile has `locked_data` (name, contact, education — AI never modifies) and `editable_data` (summary, skills, experience bullets, projects — AI rewrites per JD).
2. **JD-Driven Tailoring** — paste a job description → Claude tailors `editable_data` → field-level diff is computed and stored as a version snapshot.
3. **Diff Review** — the API returns a structured git-diff-style diff (unchanged / removed / added lines per field) for frontend rendering.
4. **Finalize & Export** — sales team can POST manually-edited JSON, then export to a styled PDF (WeasyPrint).
5. **Application Tracker** — every exported resume is logged with job/company/date/PDF path and status workflow (applied → interviewing → offered/rejected/withdrawn).

### JSON Schema

```json
{
  "locked_data": {
    "name": "...",
    "contact": { "email": "...", "phone": "...", "location": "...", "linkedin": "...", "github": "..." },
    "education": [{ "degree": "...", "institution": "...", "year": "..." }]
  },
  "editable_data": {
    "summary": "...",
    "skills": ["Python", "Django"],
    "experience": [{ "company": "...", "role": "...", "start_date": "...", "end_date": "...", "bullets": ["..."] }],
    "projects": [{ "name": "...", "description": "...", "tech_stack": "...", "bullets": ["..."] }]
  }
}
```

### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET/POST` | `/api/profiles/` | List / create profiles |
| `GET/PUT/PATCH/DELETE` | `/api/profiles/{profile_id}/` | Retrieve / update / delete |
| `POST` | `/api/profiles/{profile_id}/tailor/` | Tailor to JD; returns version with diff |
| `GET` | `/api/profiles/{profile_id}/versions/` | List versions for a profile |
| `GET` | `/api/profiles/{profile_id}/versions/{id}/` | Version detail with diff_snapshot |
| `POST` | `/api/profiles/{profile_id}/versions/{id}/finalize/` | Save manually-edited JSON |
| `POST` | `/api/profiles/{profile_id}/versions/{id}/export/` | Generate PDF, log application, stream file |
| `GET` | `/api/applications/` | All tracked applications |
| `GET` | `/api/applications/{id}/` | Application detail (includes diff_snapshot) |
| `PATCH` | `/api/applications/{id}/status/` | Update status + notes |

## Repository Structure

```
profiles_ops/              # Django project package
  settings/
    base.py                # Shared settings (reads from .env via django-environ)
    dev.py                 # Development overrides (BrowsableAPI enabled)
    prod.py                # Production overrides (security headers)
  urls.py                  # Root URL config — mounts /api/profiles/ and /api/applications/
  wsgi.py / asgi.py
apps/
  profiles/                # Profile CRUD domain
    models.py              # Profile (locked_data + editable_data JSONFields)
    serializers.py         # Validates required keys in locked/editable data
    views.py               # ProfileViewSet (full CRUD, lookup_field=profile_id)
    urls.py                # Also mounts tailoring + export routes under /<profile_id>/
    admin.py
    migrations/
    tests/
      factories.py         # ProfileFactory (factory_boy)
      test_views.py        # Profile CRUD API tests
  tailoring/               # JD tailoring, diff, PDF export domain
    models.py              # ProfileVersion (status: draft→reviewed→exported)
    serializers.py         # ProfileVersionSerializer, TailorRequestSerializer, FinalizeRequestSerializer
    views.py               # TailorView, VersionListView, VersionDetailView, FinalizeView, ExportView
    services/
      claude_service.py    # Calls Anthropic API; returns modified editable JSON
      diff_service.py      # Field-level diff: text hunks, list sets, bullet sequences
      pdf_service.py       # Jinja2 → WeasyPrint → PDF file
    templates/
      tailoring/
        resume.html        # Professional resume HTML template
    migrations/
    tests/
      factories.py         # ProfileVersionFactory
      test_diff_service.py # Unit tests for diff logic (no DB, no API calls)
  applications/            # Application tracker domain
    models.py              # Application (OneToOne → ProfileVersion, status workflow)
    serializers.py         # ApplicationSerializer (embeds diff_snapshot), ApplicationStatusSerializer
    views.py               # ApplicationViewSet (list, retrieve) + /status/ PATCH action
    urls.py
    admin.py
    migrations/
    tests/
      test_views.py        # Application list, retrieve, status update tests
requirements/
  base.txt                 # Pinned production deps
  dev.txt                  # + pytest, factory-boy, black, flake8, isort, coverage
  prod.txt                 # + gunicorn
manage.py
Makefile
docker-compose.yml         # Postgres 16 + Redis 7
.env.example
conftest.py                # Shared pytest fixtures: locked_data, editable_data
pytest.ini
setup.cfg                  # flake8, isort, coverage config
```

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (for local Postgres/Redis)

### Backend (Django)

```bash
python -m venv .venv
source .venv/bin/activate
make install          # pip install -r requirements/dev.txt
cp .env.example .env  # then fill in values
make db-up            # start docker services
make migrate          # run database migrations
make run              # start dev server on :8000
```

### Frontend (React SPA)

```bash
cd frontend
npm install
npm run dev           # starts on http://localhost:5173 (proxies /api → :8000)
```

Both servers must run simultaneously. The Vite dev server proxies all `/api/*` requests to Django.

## Key Commands

### Backend (run from repo root)

| Command | Description |
|---|---|
| `make install` | Install dev dependencies |
| `make run` | Start Django dev server (`manage.py runserver`) |
| `make migrate` | Apply database migrations |
| `make migrations` | Create new migrations (`makemigrations`) |
| `make test` | Run full test suite |
| `make test-fast` | Run tests skipping slow/integration tests |
| `make lint` | Run flake8 + isort check |
| `make fmt` | Auto-format with Black + isort |
| `make db-up` | Start Docker services (Postgres, Redis) |
| `make db-down` | Stop Docker services |
| `make shell` | Django shell (`manage.py shell_plus`) |

### Frontend (run from `frontend/`)

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start Vite dev server on :5173 |
| `npm run build` | Production build to `frontend/dist/` |
| `npm run preview` | Preview production build |

## Code Conventions

### Formatting & Linting
- **Black** for formatting — line length **88**
- **isort** for import ordering — `profile = black`
- **flake8** for linting — `max-line-length = 88`, `extend-ignore = E203`
- Run `make fmt` before committing; CI enforces `make lint`

### Python Style
- Type hints on all public functions and methods
- Prefer dataclasses or Pydantic models for structured data over plain dicts
- No bare `except:` — always catch specific exception types
- Use `__all__` in modules that have a public API

### Django Conventions
- **Models**: singular names (`Profile`, not `Profiles`); always define `Meta.ordering`; use `get_absolute_url()` where appropriate
- **Views**: class-based views (CBVs) for CRUD resources; function-based views (FBVs) for one-off or simple endpoints
- **Serializers**: Django REST Framework serializers for all API responses; never return raw model `__dict__`
- **URLs**: use `router.register()` for ViewSets; name all URL patterns
- **Apps**: one app per bounded domain; apps are self-contained (models, views, serializers, urls, tests all inside the app)
- **Settings**: never hardcode secrets; always read from `os.environ` or `django-environ`
- **Migrations**: always review auto-generated migrations before committing; add `RunPython` for data migrations

### Imports order (isort)
```python
# 1. stdlib
import os
from typing import Optional

# 2. third-party
import django
from rest_framework import serializers

# 3. local (project)
from apps.profiles.models import Profile
```

## Testing

- **Framework**: `pytest` + `pytest-django`
- **Factories**: `factory_boy` for all test data — never create model instances inline
- **Coverage**: minimum **80%**; new code must not lower coverage
- **Test layout**: unit tests live in `apps/<app>/tests/`; integration tests live in `tests/`
- **Naming**: test files `test_<module>.py`; test functions `test_<behaviour>_<condition>`

```bash
make test              # full suite
make test-fast         # exclude @pytest.mark.slow
pytest apps/profiles/  # single app
pytest -k "test_create"  # filter by name
```

## Environment Variables

Copy `.env.example` to `.env` (never commit `.env`).

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | Yes | Django secret key |
| `DATABASE_URL` | Yes | Postgres connection string |
| `ALLOWED_HOSTS` | Yes | Comma-separated hostnames |
| `DEBUG` | No | `True` for dev, `False` for prod |
| `REDIS_URL` | No | Redis connection string (caching/celery) |

## Git Workflow

- **Main branch**: `main` — protected, no direct pushes
- **Feature branches**: `feature/<short-description>`
- **Bug fix branches**: `fix/<short-description>`
- **Claude AI branches**: `claude/<description>` (auto-created by Claude Code)
- **Commit messages**: imperative mood, present tense (`Add profile serializer`, not `Added`)
- **PR requirement**: all changes via pull request; squash-merge preferred

## Frontend Structure

```
frontend/
  src/
    api/
      client.ts          # Axios instance, base URL /api, error normalisation
      profiles.ts        # Profile CRUD
      tailoring.ts       # Tailor, list/get versions, finalize, export (blob)
      applications.ts    # List, get, update status
    components/
      Navbar.tsx
      Badge.tsx / LoadingSpinner.tsx / ErrorAlert.tsx
      TextDiffViewer.tsx   # Unified diff with +/- line rendering
      SkillsDiffViewer.tsx # Skill tags: red=removed, gray=unchanged, green=added
      BulletsDiffViewer.tsx# Bullet list with inline diff colouring
    pages/
      ProfilesPage.tsx     # Profile card grid + create button
      ProfileFormPage.tsx  # Structured form → POST /api/profiles/
      TailorPage.tsx       # JD textarea + company/title → POST /tailor/
      DiffReviewPage.tsx   # Two-column: diff (left) | editable final (right)
      ApplicationsPage.tsx # Table with inline status/notes editing
    types/api.ts           # TypeScript interfaces for all API shapes
    App.tsx                # BrowserRouter + all routes
    main.tsx / index.css
  package.json / vite.config.ts / tailwind.config.js / tsconfig.json
```

### Routes

| Path | Page |
|---|---|
| `/profiles` | Profile card grid |
| `/profiles/new` | Create profile form |
| `/profiles/:id/tailor` | JD input → trigger Claude |
| `/profiles/:id/versions/:vid/review` | Diff review + inline edit + export |
| `/applications` | Application tracker table |

## AI Assistant Guidelines

These rules apply specifically to Claude and other AI assistants working in this repo:

1. **Read this file first** on every session before touching code.
2. **Follow existing patterns** — before introducing a new abstraction, check whether a similar one already exists.
3. **Run `make lint` and `make test`** before marking any task complete. Do not claim success unless both pass.
4. **Never commit secrets** — `.env`, credentials, API keys. Reject any task that would put secrets in version control.
5. **Keep migrations clean** — always review auto-generated migration files; add comments to non-obvious `RunPython` operations.
6. **Match the app structure** — new Django functionality belongs inside an app under `apps/`; do not add loose modules at the root.
7. **Keep `requirements/` in sync** — any new `import` of a third-party package must be reflected in `requirements/base.txt` or `requirements/dev.txt`.
8. **No half-finished features** — if a task is too large to complete atomically, break it into smaller, independently working steps and complete each fully.
9. **Update this file** when you establish a new convention, add a significant dependency, or change a workflow.
