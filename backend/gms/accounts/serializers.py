from rest_framework import serializers
from .models import (
    CustomUser,
    Role,
    UserRole,
    BaseProfile,
    StudentProfile,
    StaffProfile,
    PrivacySettings,
)
from grievances.serializers import get_department_full_name


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"


class UserRoleSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = UserRole
        fields = ["id", "role", "role_name"]


class BaseProfileSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = BaseProfile
        fields = ["full_name", "age", "gender", "department", "department_name"]

    def get_department_name(self, obj):
        return get_department_full_name(obj.department) if obj.department else None


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ["grievances_submitted", "grievances_addressed", "satisfaction_score"]


class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = ["is_assigned"]


class PrivacySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacySettings
        fields = ["profile_visibility"]


class UserSerializer(serializers.ModelSerializer):
    roles = UserRoleSerializer(source="user_roles", many=True, read_only=True)
    profile = BaseProfileSerializer()
    student_profile = StudentProfileSerializer(read_only=True)
    staff_profile = StaffProfileSerializer(read_only=True)
    privacy_settings = PrivacySettingsSerializer()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "username",
            "is_private",
            "institutional_id",
            "is_verified",
            "roles",
            "profile",
            "student_profile",
            "staff_profile",
            "privacy_settings",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "roles",
            "student_profile",
            "staff_profile",
        ]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)
        privacy_data = validated_data.pop("privacy_settings", None)

        # Update user instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update profile
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        # Update privacy settings
        if privacy_data:
            privacy = instance.privacy_settings
            for attr, value in privacy_data.items():
                setattr(privacy, attr, value)
            privacy.save()

        return instance


class PublicUserSerializer(serializers.ModelSerializer):
    profile = BaseProfileSerializer(read_only=True)
    roles = UserRoleSerializer(source="user_roles", many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "profile", "roles", "created_at"]
        read_only_fields = ["id", "username", "profile", "roles", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=[("student", "Student"), ("staff", "Staff")], write_only=True
    )
    department = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )

    class Meta:
        model = CustomUser
        fields = [
            "email",
            "username",
            "password",
            "role",
            "department",
            "institutional_id",
            "id_photo",
        ]

    def create(self, validated_data):
        role_choice = validated_data.pop("role")

        # Staff role users get is_staff=True for Django internal checks
        is_staff = role_choice == "staff"

        # Map department code to full name
        department_code = validated_data.get("department", "")
        department_full_name = (
            get_department_full_name(department_code) if department_code else ""
        )

        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            institutional_id=validated_data.get("institutional_id"),
            id_photo=validated_data.get("id_photo"),
            is_staff=is_staff,
        )
        BaseProfile.objects.create(
            user=user,
            full_name=validated_data["username"],
            department=department_full_name,
        )
        PrivacySettings.objects.create(user=user)

        if role_choice == "staff":
            role, _ = Role.objects.get_or_create(name=Role.STAFF)
            UserRole.objects.create(user=user, role=role)
            StaffProfile.objects.create(user=user)
        else:
            role, _ = Role.objects.get_or_create(name=Role.STUDENT)
            UserRole.objects.create(user=user, role=role)
            StudentProfile.objects.create(user=user)

        return user
