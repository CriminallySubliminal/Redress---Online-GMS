from django.contrib import admin
from .models import Category, Grievance, GrievanceStatusHistory, Attachment

admin.site.register(Category)
admin.site.register(Grievance)
admin.site.register(GrievanceStatusHistory)
admin.site.register(Attachment)
