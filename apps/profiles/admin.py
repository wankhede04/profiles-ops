from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["profile_id", "created_at", "updated_at"]
    search_fields = ["profile_id"]
    readonly_fields = ["created_at", "updated_at"]
