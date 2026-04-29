from django.db import models


class ProfileVersion(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        REVIEWED = "reviewed", "Reviewed"
        EXPORTED = "exported", "Exported"

    profile = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="versions",
    )
    job_title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    jd_text = models.TextField()
    original_editable = models.JSONField()
    tailored_editable = models.JSONField()
    diff_snapshot = models.JSONField()
    # Populated after sales team reviews/edits; falls back to tailored_editable for export
    final_editable = models.JSONField(null=True, blank=True)
    pdf_path = models.CharField(max_length=500, blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.profile.profile_id} — {self.company} ({self.job_title})"

    @property
    def export_editable(self) -> dict:
        """Return final_editable if set, otherwise tailored_editable."""
        return self.final_editable if self.final_editable is not None else self.tailored_editable
