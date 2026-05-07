from django_filters import rest_framework as filters
from .models import Grievance

class GrievanceFilter(filters.FilterSet):
    start_date = filters.DateFilter(field_name="created_at", lookup_expr='gte')
    end_date = filters.DateFilter(field_name="created_at", lookup_expr='lte')

    class Meta:
        model = Grievance
        fields = ['status', 'priority', 'category', 'assigned_staff', 'is_public']
