import factory

from apps.profiles.tests.factories import ProfileFactory
from apps.tailoring.models import ProfileVersion


class ProfileVersionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProfileVersion

    profile = factory.SubFactory(ProfileFactory)
    job_title = "Backend Engineer"
    company = "Startup Inc"
    jd_text = "We are looking for a Python backend engineer with Django experience."
    original_editable = factory.LazyAttribute(lambda o: o.profile.editable_data)
    tailored_editable = factory.LazyAttribute(lambda o: o.profile.editable_data)
    diff_snapshot = factory.LazyFunction(dict)
    status = ProfileVersion.Status.DRAFT
