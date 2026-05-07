from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GrievanceInteractionViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'votes', GrievanceInteractionViewSet, basename='vote')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]
