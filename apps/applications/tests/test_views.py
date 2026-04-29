import pytest
from rest_framework.test import APIClient

from apps.applications.models import Application
from apps.profiles.tests.factories import ProfileFactory
from apps.tailoring.tests.factories import ProfileVersionFactory


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def application(db):
    version = ProfileVersionFactory()
    return Application.objects.create(
        profile=version.profile,
        version=version,
        job_title=version.job_title,
        company=version.company,
        pdf_path="/tmp/test.pdf",
    )


@pytest.mark.django_db
class TestApplicationList:
    def test_list_empty(self, client):
        resp = client.get("/api/applications/")
        assert resp.status_code == 200
        assert resp.data["count"] == 0

    def test_list_returns_applications(self, client, application):
        resp = client.get("/api/applications/")
        assert resp.data["count"] == 1
        assert resp.data["results"][0]["company"] == application.company

    def test_retrieve(self, client, application):
        resp = client.get(f"/api/applications/{application.pk}/")
        assert resp.status_code == 200
        assert resp.data["diff_snapshot"] == application.version.diff_snapshot


@pytest.mark.django_db
class TestApplicationStatusUpdate:
    def test_update_status(self, client, application):
        resp = client.patch(
            f"/api/applications/{application.pk}/status/",
            {"status": "interviewing", "notes": "Phone screen scheduled."},
            format="json",
        )
        assert resp.status_code == 200
        application.refresh_from_db()
        assert application.status == Application.Status.INTERVIEWING
        assert application.notes == "Phone screen scheduled."

    def test_invalid_status(self, client, application):
        resp = client.patch(
            f"/api/applications/{application.pk}/status/",
            {"status": "flying"},
            format="json",
        )
        assert resp.status_code == 400
