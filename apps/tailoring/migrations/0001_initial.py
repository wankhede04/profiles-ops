import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("profiles", "0001_initial"),
    ]
    operations = [
        migrations.CreateModel(
            name="ProfileVersion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("job_title", models.CharField(max_length=255)),
                ("company", models.CharField(max_length=255)),
                ("jd_text", models.TextField()),
                ("original_editable", models.JSONField()),
                ("tailored_editable", models.JSONField()),
                ("diff_snapshot", models.JSONField()),
                ("final_editable", models.JSONField(blank=True, null=True)),
                ("pdf_path", models.CharField(blank=True, default="", max_length=500)),
                (
                    "status",
                    models.CharField(
                        choices=[("draft", "Draft"), ("reviewed", "Reviewed"), ("exported", "Exported")],
                        default="draft",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "profile",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="versions",
                        to="profiles.profile",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
