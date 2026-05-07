from rest_framework import serializers
from .models import Category, Grievance, GrievanceStatusHistory, Attachment

DEPARTMENT_MAPPING = {
    "cs": "Computer Science",
    "ee": "Electrical Engineering",
    "me": "Mechanical Engineering",
    "bus": "Business",
    "arts": "Arts & Humanities",
    "hr": "Human Resources",
    "counseling": "Counseling & Wellness",
    "it_support": "IT Support",
    "facilities": "Facilities Management",
    "finance": "Finance",
    "registrar": "Registrar's Office",
}


def get_department_full_name(department_code):
    return DEPARTMENT_MAPPING.get(department_code, department_code)


from interactions.serializers import CommentSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = "__all__"
        read_only_fields = ["uploaded_by"]


class GrievanceStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GrievanceStatusHistory
        fields = "__all__"


class GrievanceSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    status_history = GrievanceStatusHistorySerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    created_by_info = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)

    assigned_staff_info = serializers.SerializerMethodField()

    class Meta:
        model = Grievance
        fields = [
            "id",
            "title",
            "description",
            "created_by_info",
            "is_anonymous",
            "is_public",
            "status",
            "priority",
            "assigned_staff",
            "assigned_staff_info",
            "category",
            "category_name",
            "location",
            "due_date",
            "attachments",
            "status_history",
            "comments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "status",
            "assigned_staff",
        ]

    def get_assigned_staff_info(self, obj):
        if not obj.assigned_staff:
            return None
        staff = obj.assigned_staff
        name = "Staff Member"
        department = "N/A"

        if hasattr(staff, "profile") and staff.profile.full_name:
            name = staff.profile.full_name
            department = staff.profile.department

        return {"id": staff.id, "name": name, "department": department}

    def get_created_by_info(self, obj):
        if obj.is_anonymous:
            return {"id": None, "name": "Anonymous"}
        user = obj.created_by
        name = "Unknown"
        full_name = None
        department = None

        if hasattr(user, "profile") and user.profile.full_name:
            full_name = user.profile.full_name
            name = full_name
            department = user.profile.department
        else:
            name = user.username or user.email.split("@")[0]

        info = {"id": user.id, "name": name, "email": user.email}

        request = self.context.get("request")
        is_staff = False
        if request and request.user.is_authenticated:
            # Check if user has staff or admin role, or is_staff flag
            is_staff = (
                getattr(request.user, "is_staff", False)
                or request.user.user_roles.filter(
                    role__name__in=["staff", "admin"]
                ).exists()
            )

        if is_staff:
            info["full_name"] = full_name or name
            info["department"] = department or "N/A"
            info["institutional_id"] = user.institutional_id

        return info


class StaffGrievanceSerializer(GrievanceSerializer):
    class Meta(GrievanceSerializer.Meta):
        read_only_fields = ["id", "created_at", "updated_at"]
