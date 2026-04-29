from django.contrib import admin

from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["profile", "job_title", "company", "status", "date_applied"]
    list_filter = ["status"]
    search_fields = ["profile__profile_id", "company", "job_title"]
    readonly_fields = ["date_applied", "created_at", "pdf_path"]
