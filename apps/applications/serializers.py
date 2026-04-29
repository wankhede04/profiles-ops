from rest_framework import serializers

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    profile_id = serializers.SlugRelatedField(source="profile", slug_field="profile_id", read_only=True)
    diff_snapshot = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id",
            "profile_id",
            "version",
            "job_title",
            "company",
            "date_applied",
            "pdf_path",
            "status",
            "notes",
            "diff_snapshot",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "profile_id",
            "version",
            "job_title",
            "company",
            "date_applied",
            "pdf_path",
            "diff_snapshot",
            "created_at",
        ]

    def get_diff_snapshot(self, obj: Application) -> dict:
        return obj.version.diff_snapshot


class ApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["status", "notes"]
