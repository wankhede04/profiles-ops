import django
import pytest
from django.conf import settings


@pytest.fixture
def locked_data():
    return {
        "name": "Vijay Sharma",
        "contact": {
            "email": "vijay@example.com",
            "phone": "+91-98765-43210",
            "location": "Bangalore, India",
            "linkedin": "linkedin.com/in/vijay",
            "github": "github.com/vijay",
        },
        "education": [
            {
                "degree": "B.Tech Computer Science",
                "institution": "IIT Bombay",
                "year": "2019",
            }
        ],
    }


@pytest.fixture
def editable_data():
    return {
        "summary": "Backend engineer with 5 years experience in Python and distributed systems.",
        "skills": ["Python", "Django", "PostgreSQL", "Redis", "Docker"],
        "experience": [
            {
                "company": "Acme Corp",
                "role": "Senior Software Engineer",
                "start_date": "2021-06",
                "end_date": "Present",
                "bullets": [
                    "Led migration of monolith to microservices, reducing p99 latency by 40%.",
                    "Designed REST APIs consumed by 3 mobile clients.",
                ],
            }
        ],
        "projects": [
            {
                "name": "OpenSearch Connector",
                "description": "Python library for bulk-indexing Django ORM queries into OpenSearch.",
                "tech_stack": "Python, Django, OpenSearch",
                "bullets": ["Published on PyPI with 500+ monthly downloads."],
            }
        ],
    }
