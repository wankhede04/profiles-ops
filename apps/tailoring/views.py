from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.profiles.models import Profile

from .models import ProfileVersion
from .serializers import FinalizeRequestSerializer, ProfileVersionSerializer, TailorRequestSerializer
from .services import claude_service, diff_service, pdf_service


def _get_profile(profile_id: str) -> Profile:
    return get_object_or_404(Profile, profile_id=profile_id)


def _get_version(profile: Profile, pk: int) -> ProfileVersion:
    return get_object_or_404(ProfileVersion, pk=pk, profile=profile)


class TailorView(APIView):
    """
    POST /api/profiles/{profile_id}/tailor/

    Body: { job_title, company, jd_text }
    Returns the created ProfileVersion with diff_snapshot.
    """

    def post(self, request, profile_id: str):
        profile = _get_profile(profile_id)
        ser = TailorRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        original_editable = profile.editable_data
        tailored_editable = claude_service.tailor_resume(
            locked_data=profile.locked_data,
            editable_data=original_editable,
            jd_text=ser.validated_data["jd_text"],
        )
        diff = diff_service.compute_diff(original_editable, tailored_editable)

        version = ProfileVersion.objects.create(
            profile=profile,
            job_title=ser.validated_data["job_title"],
            company=ser.validated_data["company"],
            jd_text=ser.validated_data["jd_text"],
            original_editable=original_editable,
            tailored_editable=tailored_editable,
            diff_snapshot=diff,
        )
        return Response(ProfileVersionSerializer(version).data, status=status.HTTP_201_CREATED)


class VersionListView(generics.ListAPIView):
    """GET /api/profiles/{profile_id}/versions/"""

    serializer_class = ProfileVersionSerializer

    def get_queryset(self):
        profile = _get_profile(self.kwargs["profile_id"])
        return ProfileVersion.objects.filter(profile=profile)


class VersionDetailView(generics.RetrieveAPIView):
    """GET /api/profiles/{profile_id}/versions/{pk}/"""

    serializer_class = ProfileVersionSerializer

    def get_object(self):
        profile = _get_profile(self.kwargs["profile_id"])
        return _get_version(profile, self.kwargs["pk"])


class FinalizeView(APIView):
    """
    POST /api/profiles/{profile_id}/versions/{pk}/finalize/

    Body: { final_editable }
    Stores the sales-team-reviewed editable JSON and marks version as reviewed.
    """

    def post(self, request, profile_id: str, pk: int):
        profile = _get_profile(profile_id)
        version = _get_version(profile, pk)

        ser = FinalizeRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        version.final_editable = ser.validated_data["final_editable"]
        version.status = ProfileVersion.Status.REVIEWED
        version.save(update_fields=["final_editable", "status"])

        return Response(ProfileVersionSerializer(version).data)


class ExportView(APIView):
    """
    POST /api/profiles/{profile_id}/versions/{pk}/export/

    Generates the PDF, logs the Application, and streams the file back.
    Idempotent: re-exporting regenerates the PDF and updates the existing Application.
    """

    def post(self, request, profile_id: str, pk: int):
        from apps.applications.models import Application

        profile = _get_profile(profile_id)
        version = _get_version(profile, pk)

        pdf_path = pdf_service.render_resume_pdf(profile, version)

        version.pdf_path = pdf_path
        version.status = ProfileVersion.Status.EXPORTED
        version.save(update_fields=["pdf_path", "status"])

        app, _ = Application.objects.update_or_create(
            version=version,
            defaults={
                "profile": profile,
                "job_title": version.job_title,
                "company": version.company,
                "pdf_path": pdf_path,
            },
        )

        try:
            file_handle = open(pdf_path, "rb")
        except FileNotFoundError:
            return Response({"detail": "PDF generation failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        import os
        filename = os.path.basename(pdf_path)
        response = FileResponse(file_handle, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response["X-Application-Id"] = str(app.pk)
        return response
