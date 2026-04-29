import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("profiles", "0001_initial"),
        ("tailoring", "0001_initial"),
    ]
    operations = [
        migrations.CreateModel(
            name="Application",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("job_title", models.CharField(max_length=255)),
                ("company", models.CharField(max_length=255)),
                ("date_applied", models.DateField(auto_now_add=True)),
                ("pdf_path", models.CharField(max_length=500)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("applied", "Applied"),
                            ("interviewing", "Interviewing"),
                            ("offered", "Offered"),
                            ("rejected", "Rejected"),
                            ("withdrawn", "Withdrawn"),
                        ],
                        default="applied",
                        max_length=20,
                    ),
                ),
                ("notes", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "profile",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="applications",
                        to="profiles.profile",
                    ),
                ),
                (
                    "version",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="application",
                        to="tailoring.profileversion",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
