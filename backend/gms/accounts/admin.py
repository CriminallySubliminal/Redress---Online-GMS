from django.contrib import admin
from .models import CustomUser, Role, UserRole, BaseProfile, StudentProfile, StaffProfile, PrivacySettings

admin.site.register(CustomUser)
admin.site.register(Role)
admin.site.register(UserRole)
admin.site.register(BaseProfile)
admin.site.register(StudentProfile)
admin.site.register(StaffProfile)
admin.site.register(PrivacySettings)
