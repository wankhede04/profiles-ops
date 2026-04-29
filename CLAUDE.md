# CLAUDE.md — profiles-ops

This file is the primary reference for AI assistants (Claude) working in this repository. Read it before making any changes.

## Project Overview

**profiles-ops** is a Python/Django REST API service for profile management operations. It handles CRUD operations and business logic around user/entity profiles.

> Update this section with architecture details, external integrations, and service boundaries as the project matures.

## Repository Structure

```
profiles_ops/          # Django project package
  settings/
    base.py            # Shared settings
    dev.py             # Development overrides
    prod.py            # Production overrides
  urls.py              # Root URL configuration
  wsgi.py
  asgi.py
apps/                  # Django applications (one per domain)
  profiles/            # Core profiles domain
    models.py
    views.py
    serializers.py
    urls.py
    admin.py
    tests/
tests/                 # Integration and cross-app tests
requirements/
  base.txt             # Production dependencies (pinned)
  dev.txt              # Dev/test extras
  prod.txt             # Production extras
manage.py
Makefile               # Developer shortcuts
docker-compose.yml     # Local dev stack (Postgres, Redis)
.env.example           # Required environment variable template
```

## Development Setup

### Prerequisites
- Python 3.11+
- Docker & Docker Compose (for local Postgres/Redis)

### First-time setup

```bash
python -m venv .venv
source .venv/bin/activate
make install          # pip install -r requirements/dev.txt
cp .env.example .env  # then fill in values
make db-up            # start docker services
make migrate          # run database migrations
make run              # start dev server on :8000
```

## Key Commands

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
