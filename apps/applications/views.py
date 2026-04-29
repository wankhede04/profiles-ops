from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Application
from .serializers import ApplicationSerializer, ApplicationStatusSerializer


class ApplicationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Application.objects.select_related("profile", "version").all()
    serializer_class = ApplicationSerializer

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        """PATCH /api/applications/{id}/status/ — update status and notes."""
        app = self.get_object()
        ser = ApplicationStatusSerializer(app, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ApplicationSerializer(app).data)
