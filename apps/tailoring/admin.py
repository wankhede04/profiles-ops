from django.contrib import admin

from .models import ProfileVersion


@admin.register(ProfileVersion)
class ProfileVersionAdmin(admin.ModelAdmin):
    list_display = ["profile", "job_title", "company", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["profile__profile_id", "company", "job_title"]
    readonly_fields = ["original_editable", "tailored_editable", "diff_snapshot", "created_at"]
