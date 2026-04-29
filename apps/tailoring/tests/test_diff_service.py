import pytest

from apps.tailoring.services.diff_service import compute_diff


@pytest.fixture
def base_editable():
    return {
        "summary": "Experienced Python developer.",
        "skills": ["Python", "Django", "PostgreSQL"],
        "experience": [
            {
                "company": "Acme",
                "role": "Engineer",
                "start_date": "2020-01",
                "end_date": "Present",
                "bullets": ["Built API endpoints.", "Mentored juniors."],
            }
        ],
        "projects": [
            {
                "name": "MyLib",
                "description": "A useful library.",
                "tech_stack": "Python",
                "bullets": ["Published on PyPI."],
            }
        ],
    }


class TestTextDiff:
    def test_unchanged_summary(self, base_editable):
        diff = compute_diff(base_editable, base_editable)
        assert diff["summary"]["changed"] is False
        assert all(l["type"] == "unchanged" for l in diff["summary"]["lines"])

    def test_modified_summary(self, base_editable):
        modified = {**base_editable, "summary": "Senior Python developer with cloud expertise."}
        diff = compute_diff(base_editable, modified)
        assert diff["summary"]["changed"] is True
        types = {l["type"] for l in diff["summary"]["lines"]}
        assert "removed" in types
        assert "added" in types


class TestListDiff:
    def test_skills_added(self, base_editable):
        modified = {**base_editable, "skills": ["Python", "Django", "PostgreSQL", "Redis"]}
        diff = compute_diff(base_editable, modified)
        assert "Redis" in diff["skills"]["added"]
        assert diff["skills"]["changed"] is True

    def test_skills_removed(self, base_editable):
        modified = {**base_editable, "skills": ["Python", "Django"]}
        diff = compute_diff(base_editable, modified)
        assert "PostgreSQL" in diff["skills"]["removed"]

    def test_skills_unchanged(self, base_editable):
        diff = compute_diff(base_editable, base_editable)
        assert diff["skills"]["changed"] is False
        assert diff["skills"]["added"] == []
        assert diff["skills"]["removed"] == []


class TestExperienceDiff:
    def test_bullet_modified(self, base_editable):
        modified_exp = [
            {
                "company": "Acme",
                "role": "Engineer",
                "start_date": "2020-01",
                "end_date": "Present",
                "bullets": ["Architected scalable REST APIs serving 10k RPS.", "Mentored juniors."],
            }
        ]
        modified = {**base_editable, "experience": modified_exp}
        diff = compute_diff(base_editable, modified)
        entry = diff["experience"][0]
        assert entry["changed"] is True
        bullet_types = {b["type"] for b in entry["bullets"]}
        assert "removed" in bullet_types
        assert "added" in bullet_types

    def test_no_change(self, base_editable):
        diff = compute_diff(base_editable, base_editable)
        assert diff["experience"][0]["changed"] is False


class TestProjectDiff:
    def test_description_changed(self, base_editable):
        modified_proj = [
            {
                "name": "MyLib",
                "description": "A widely adopted Python library.",
                "tech_stack": "Python",
                "bullets": ["Published on PyPI."],
            }
        ]
        modified = {**base_editable, "projects": modified_proj}
        diff = compute_diff(base_editable, modified)
        assert diff["projects"][0]["changed"] is True
        assert diff["projects"][0]["description"]["changed"] is True
