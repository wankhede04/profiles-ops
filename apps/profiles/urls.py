from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.tailoring.views import ExportView, FinalizeView, TailorView, VersionDetailView, VersionListView

from .views import ProfileViewSet

router = DefaultRouter()
router.register("", ProfileViewSet, basename="profile")

urlpatterns = router.urls + [
    path("<slug:profile_id>/tailor/", TailorView.as_view(), name="profile-tailor"),
    path("<slug:profile_id>/versions/", VersionListView.as_view(), name="profile-version-list"),
    path("<slug:profile_id>/versions/<int:pk>/", VersionDetailView.as_view(), name="profile-version-detail"),
    path("<slug:profile_id>/versions/<int:pk>/finalize/", FinalizeView.as_view(), name="profile-version-finalize"),
    path("<slug:profile_id>/versions/<int:pk>/export/", ExportView.as_view(), name="profile-version-export"),
]
