import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gms.settings')
django.setup()

from grievances.models import Category

categories = [
    {'name': 'Infrastructure', 'description': 'Issues related to buildings, classrooms, or physical facilities.'},
    {'name': 'Academic', 'description': 'Issues related to courses, grading, or faculty.'},
    {'name': 'Hostel', 'description': 'Issues related to dormitory or student living spaces.'},
    {'name': 'Cafeteria', 'description': 'Issues related to food services or dining halls.'},
    {'name': 'Administration', 'description': 'Issues related to registration, fees, or official paperwork.'},
    {'name': 'Other', 'description': 'Any other concerns not covered by the categories above.'},
]

for cat_data in categories:
    obj, created = Category.objects.get_or_create(name=cat_data['name'], defaults={'description': cat_data['description']})
    if created:
        print(f"Created category: {obj.name}")
    else:
        print(f"Category already exists: {obj.name}")

print("Seeding complete.")
