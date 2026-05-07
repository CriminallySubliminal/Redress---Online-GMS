from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, GrievanceViewSet, AttachmentViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'grievances', GrievanceViewSet, basename='grievance')
router.register(r'attachments', AttachmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
