import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from .factories import ProfileFactory


@pytest.fixture
def client():
    return APIClient()


@pytest.mark.django_db
class TestProfileList:
    def test_list_empty(self, client):
        resp = client.get("/api/profiles/")
        assert resp.status_code == 200
        assert resp.data["count"] == 0

    def test_list_returns_profiles(self, client):
        ProfileFactory.create_batch(3)
        resp = client.get("/api/profiles/")
        assert resp.data["count"] == 3


@pytest.mark.django_db
class TestProfileCreate:
    def test_create_valid(self, client, locked_data, editable_data):
        payload = {
            "profile_id": "vijay-backend",
            "locked_data": locked_data,
            "editable_data": editable_data,
        }
        resp = client.post("/api/profiles/", payload, format="json")
        assert resp.status_code == 201
        assert resp.data["profile_id"] == "vijay-backend"

    def test_create_duplicate_profile_id(self, client, locked_data, editable_data):
        ProfileFactory(profile_id="dup-id")
        payload = {
            "profile_id": "dup-id",
            "locked_data": locked_data,
            "editable_data": editable_data,
        }
        resp = client.post("/api/profiles/", payload, format="json")
        assert resp.status_code == 400

    def test_create_missing_locked_key(self, client, editable_data):
        payload = {
            "profile_id": "bad-profile",
            "locked_data": {"name": "Test"},  # missing contact, education
            "editable_data": editable_data,
        }
        resp = client.post("/api/profiles/", payload, format="json")
        assert resp.status_code == 400

    def test_create_missing_editable_key(self, client, locked_data):
        payload = {
            "profile_id": "bad-profile",
            "locked_data": locked_data,
            "editable_data": {"summary": "x"},  # missing skills, experience, projects
        }
        resp = client.post("/api/profiles/", payload, format="json")
        assert resp.status_code == 400


@pytest.mark.django_db
class TestProfileDetail:
    def test_retrieve(self, client):
        profile = ProfileFactory(profile_id="vijay")
        resp = client.get(f"/api/profiles/vijay/")
        assert resp.status_code == 200
        assert resp.data["profile_id"] == "vijay"

    def test_not_found(self, client):
        resp = client.get("/api/profiles/nonexistent/")
        assert resp.status_code == 404

    def test_update_editable(self, client, locked_data, editable_data):
        profile = ProfileFactory(profile_id="update-me")
        new_editable = {**profile.editable_data, "summary": "Updated summary."}
        resp = client.patch(
            "/api/profiles/update-me/",
            {"editable_data": new_editable},
            format="json",
        )
        assert resp.status_code == 200
        assert resp.data["editable_data"]["summary"] == "Updated summary."

    def test_delete(self, client):
        ProfileFactory(profile_id="delete-me")
        resp = client.delete("/api/profiles/delete-me/")
        assert resp.status_code == 204
