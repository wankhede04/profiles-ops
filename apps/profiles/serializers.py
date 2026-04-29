from rest_framework import serializers

from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id", "profile_id", "locked_data", "editable_data", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_locked_data(self, value: dict) -> dict:
        required = {"name", "contact", "education"}
        missing = required - value.keys()
        if missing:
            raise serializers.ValidationError(f"locked_data missing required keys: {missing}")
        return value

    def validate_editable_data(self, value: dict) -> dict:
        required = {"summary", "skills", "experience", "projects"}
        missing = required - value.keys()
        if missing:
            raise serializers.ValidationError(f"editable_data missing required keys: {missing}")
        return value
