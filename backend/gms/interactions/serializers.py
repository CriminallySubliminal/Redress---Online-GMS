from rest_framework import serializers
from .models import GrievanceInteraction, Comment

class GrievanceInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrievanceInteraction
        fields = '__all__'
        read_only_fields = ['user']

class CommentSerializer(serializers.ModelSerializer):
    created_by_info = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'grievance', 'created_by_info', 'content', 'is_anonymous', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']

    def get_created_by_info(self, obj):
        if obj.is_anonymous:
            return {"id": None, "name": "Anonymous", "is_staff": False}
        
        user = obj.user
        name = "Unknown"
        is_staff = False
        
        if hasattr(user, 'user_roles'):
            is_staff = user.user_roles.filter(role__name__in=['staff', 'admin']).exists()
        
        # Try to get first name from profile
        if hasattr(user, 'profile') and user.profile.full_name:
            name = user.profile.full_name.split(' ')[0]
        else:
            name = user.username or user.email.split('@')[0]
            
        return {
            "id": user.id,
            "name": name,
            "email": user.email,
            "is_staff": getattr(user, 'is_staff', False) or is_staff
        }
