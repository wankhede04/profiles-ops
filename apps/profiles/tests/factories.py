import factory

from apps.profiles.models import Profile


class ProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Profile

    profile_id = factory.Sequence(lambda n: f"test-profile-{n}")
    locked_data = factory.LazyFunction(
        lambda: {
            "name": "Test User",
            "contact": {"email": "test@example.com", "phone": "1234567890", "location": "City"},
            "education": [{"degree": "B.Tech CS", "institution": "Test University", "year": "2020"}],
        }
    )
    editable_data = factory.LazyFunction(
        lambda: {
            "summary": "A great engineer.",
            "skills": ["Python", "Django"],
            "experience": [
                {
                    "company": "Company A",
                    "role": "Engineer",
                    "start_date": "2020-01",
                    "end_date": "Present",
                    "bullets": ["Built feature X."],
                }
            ],
            "projects": [
                {
                    "name": "Project Alpha",
                    "description": "A useful tool.",
                    "tech_stack": "Python",
                    "bullets": ["Did Y."],
                }
            ],
        }
    )
