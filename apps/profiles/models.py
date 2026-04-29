from django.db import models


class Profile(models.Model):
    profile_id = models.SlugField(max_length=100, unique=True)
    locked_data = models.JSONField()
    editable_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.profile_id
