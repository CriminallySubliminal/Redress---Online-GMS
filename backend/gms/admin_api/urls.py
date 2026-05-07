from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminAnalyticsView, AdminLoginView, AdminUserViewSet, AdminGrievanceViewSet

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'grievances', AdminGrievanceViewSet, basename='admin-grievances')

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('', include(router.urls)),
]

