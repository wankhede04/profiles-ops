from django.db import models


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "applied", "Applied"
        INTERVIEWING = "interviewing", "Interviewing"
        OFFERED = "offered", "Offered"
        REJECTED = "rejected", "Rejected"
        WITHDRAWN = "withdrawn", "Withdrawn"

    profile = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="applications",
    )
    version = models.OneToOneField(
        "tailoring.ProfileVersion",
        on_delete=models.CASCADE,
        related_name="application",
    )
    job_title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    date_applied = models.DateField(auto_now_add=True)
    pdf_path = models.CharField(max_length=500)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.profile.profile_id} → {self.company} ({self.job_title})"
