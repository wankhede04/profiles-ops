#!/bin/sh
set -e

echo "Waiting for database..."
until python - <<'EOF'
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "profiles_ops.settings.prod")
django.setup()
from django.db import connection
connection.ensure_connection()
print("ok")
EOF
do
    echo "  database not ready — retrying in 2s..."
    sleep 2
done

echo "Running migrations..."
python manage.py migrate --noinput

exec "$@"
