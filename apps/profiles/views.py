from rest_framework import mixins, viewsets
from rest_framework.response import Response

from .models import Profile
from .serializers import ProfileSerializer


class ProfileViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    lookup_field = "profile_id"
