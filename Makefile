.PHONY: install run migrate migrations test test-fast lint fmt db-up db-down shell coverage

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
