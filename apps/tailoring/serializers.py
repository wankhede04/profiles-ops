from rest_framework import serializers

from .models import ProfileVersion


class ProfileVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileVersion
        fields = [
            "id",
            "profile",
            "job_title",
            "company",
            "jd_text",
            "original_editable",
            "tailored_editable",
            "diff_snapshot",
            "final_editable",
            "pdf_path",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "profile",
            "original_editable",
            "tailored_editable",
            "diff_snapshot",
            "pdf_path",
            "created_at",
        ]


class TailorRequestSerializer(serializers.Serializer):
    job_title = serializers.CharField(max_length=255)
    company = serializers.CharField(max_length=255)
    jd_text = serializers.CharField()


class FinalizeRequestSerializer(serializers.Serializer):
    final_editable = serializers.JSONField()

    def validate_final_editable(self, value: dict) -> dict:
        required = {"summary", "skills", "experience", "projects"}
        missing = required - value.keys()
        if missing:
            raise serializers.ValidationError(f"final_editable missing required keys: {missing}")
        return value
