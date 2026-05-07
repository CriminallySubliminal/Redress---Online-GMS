from django.db import models
from django.conf import settings
from grievances.models import Grievance

class GrievanceInteraction(models.Model):
    INTERACTION_CHOICES = [
        ('upvote', 'Upvote'),
        ('downvote', 'Downvote'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    grievance = models.ForeignKey(Grievance, on_delete=models.CASCADE, related_name='interactions')
    type = models.CharField(max_length=10, choices=INTERACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'grievance')

    def __str__(self):
        return f"{self.user.email} -> {self.type} -> {self.grievance.title}"

class Comment(models.Model):
    grievance = models.ForeignKey(Grievance, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment on {self.grievance.title}"
