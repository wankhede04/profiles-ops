.PHONY: install run migrate migrations test test-fast lint fmt db-up db-down shell coverage \
        docker-build docker-up docker-up-d docker-down docker-logs docker-shell docker-migrate

install:
	pip install -r requirements/dev.txt

run:
	python manage.py runserver

migrate:
	python manage.py migrate

migrations:
	python manage.py makemigrations

test:
	pytest

test-fast:
	pytest -m "not slow"

lint:
	flake8 . && isort --check-only .

fmt:
	black . && isort .

db-up:
	docker compose up -d db redis

db-down:
	docker compose down

shell:
	python manage.py shell_plus 2>/dev/null || python manage.py shell

coverage:
	coverage run -m pytest && coverage report --fail-under=80

# ── Docker ────────────────────────────────────────────────────────────────────

docker-build:
	docker compose build

docker-up:
	docker compose up

docker-up-d:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-shell:
	docker compose exec backend python manage.py shell

docker-migrate:
	docker compose exec backend python manage.py migrate
