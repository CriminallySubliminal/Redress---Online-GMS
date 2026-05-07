from rest_framework import viewsets, permissions
from .models import GrievanceInteraction, Comment
from .serializers import GrievanceInteractionSerializer, CommentSerializer

class GrievanceInteractionViewSet(viewsets.ModelViewSet):
    queryset = GrievanceInteraction.objects.all()
    serializer_class = GrievanceInteractionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
