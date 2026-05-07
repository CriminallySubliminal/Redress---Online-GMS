from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Case, When, Value, IntegerField, Q
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Category, Grievance, Attachment, GrievanceStatusHistory
from .serializers import CategorySerializer, GrievanceSerializer, AttachmentSerializer, StaffGrievanceSerializer
from .permissions import IsOwnerOrStaff
from .filters import GrievanceFilter

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class GrievanceViewSet(viewsets.ModelViewSet):
    queryset = Grievance.objects.all()
    serializer_class = GrievanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = GrievanceFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'priority_weight']

    def get_serializer_class(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return StaffGrievanceSerializer
        return GrievanceSerializer

    def get_queryset(self):
        user = self.request.user
        
        # Base queryset based on role
        if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False):
            qs = Grievance.objects.all()
            
            # Filter based on dashboard view
            view_filter = self.request.query_params.get('view_filter')
            if view_filter == 'my_tasks':
                qs = qs.filter(assigned_staff=user)
            elif view_filter == 'unassigned':
                qs = qs.filter(assigned_staff__isnull=True)
        else:
            # Users see their own grievances OR any grievance marked as public
            qs = Grievance.objects.filter(Q(created_by=user) | Q(is_public=True))
            
        # Annotate priority weight for ordering
        qs = qs.annotate(
            priority_weight=Case(
                When(priority='critical', then=Value(4)),
                When(priority='high', then=Value(3)),
                When(priority='medium', then=Value(2)),
                When(priority='low', then=Value(1)),
                default=Value(0),
                output_field=IntegerField(),
            )
        )
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        
        # Prevent unverified users from creating grievances
        if not getattr(user, 'is_verified', False):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must verify your email before submitting grievances.")
            
        # Prevent staff/admin from creating grievances
        is_staff = getattr(user, 'is_staff', False) or user.user_roles.filter(role__name__in=['staff', 'admin']).exists()
        if is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Staff and administrative accounts cannot submit grievances.")
            
        serializer.save(created_by=user, status='open')

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        
        is_staff = getattr(user, 'is_staff', False) or user.user_roles.filter(role__name__in=['staff']).exists()
        is_admin = getattr(user, 'is_superuser', False) or user.user_roles.filter(role__name__in=['admin']).exists()
        
        # If staff (but not admin) is updating status, they must be the assigned staff
        if is_staff and not is_admin:
            if 'status' in serializer.validated_data and instance.assigned_staff != user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only alter the status of grievances you have taken up.")
                
        serializer.save()



    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def take_up(self, request, pk=None):
        grievance = self.get_object()
        user = request.user
        
        # Check if user is staff
        is_staff = getattr(user, 'is_staff', False) or user.user_roles.filter(role__name__in=['staff', 'admin']).exists()
        if not is_staff:
            return Response({"error": "Only staff members can take up grievances."}, status=status.HTTP_403_FORBIDDEN)
            
        if grievance.assigned_staff is not None:
            return Response({"error": "This grievance has already been taken up."}, status=status.HTTP_400_BAD_REQUEST)
            
        grievance.assigned_staff = user
        old_status = grievance.status
        grievance.status = 'in_progress'
        grievance.save()
        
        # Create status history
        GrievanceStatusHistory.objects.create(
            grievance=grievance,
            changed_by=user,
            old_status=old_status,
            new_status='in_progress',
            note="Staff member has taken up this grievance."
        )
        
        # Return updated data using the staff serializer
        serializer = StaffGrievanceSerializer(grievance, context={'request': request})
        return Response(serializer.data)

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
