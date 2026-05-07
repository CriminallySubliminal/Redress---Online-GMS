from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.serializers import UserSerializer
from grievances.models import Grievance, Category, GrievanceStatusHistory
from grievances.serializers import StaffGrievanceSerializer

User = get_user_model()


class AdminLoginView(APIView):
    """
    Login endpoint exclusively for superusers.
    Regular users and staff are rejected even with valid credentials.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {'detail': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_superuser:
            return Response(
                {'detail': 'Access denied. Only superusers can access the admin portal.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not user.is_active:
            return Response(
                {'detail': 'This account has been deactivated.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'is_superuser': user.is_superuser,
            }
        })


class IsSuperUserOrAdminRole(permissions.BasePermission):
    """
    Allows access only to superusers or users with the 'admin' role.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return bool(user.is_superuser or user.user_roles.filter(role__name='admin').exists())

class AdminAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperUserOrAdminRole]

    def get(self, request):
        # 1. Overall Stats
        total_grievances = Grievance.objects.count()
        pending_grievances = Grievance.objects.filter(status='open').count()
        in_progress_grievances = Grievance.objects.filter(status='in_progress').count()
        resolved_grievances = Grievance.objects.filter(status='resolved').count()
        rejected_grievances = Grievance.objects.filter(status='rejected').count()

        # 2. Category Distribution
        categories = Category.objects.annotate(count=Count('grievance'))
        category_data = []
        colors = ['#0f766e', '#0d9488', '#14b8a6', '#5eead4', '#99f6e4']
        for i, cat in enumerate(categories):
            pct = (cat.count / total_grievances * 100) if total_grievances > 0 else 0
            category_data.append({
                'label': cat.name,
                'value': cat.count,
                'pct': round(pct),
                'color': colors[i % len(colors)]
            })
        category_data.sort(key=lambda x: x['value'], reverse=True)

        # 3. Status Distribution
        status_data = [
            {'label': 'Resolved', 'count': resolved_grievances, 'color': '#16a34a'},
            {'label': 'Pending', 'count': pending_grievances, 'color': '#f59e0b'},
            {'label': 'In Progress', 'count': in_progress_grievances, 'color': '#3b82f6'},
            {'label': 'Rejected', 'count': rejected_grievances, 'color': '#ef4444'},
        ]
        status_distribution = []
        for s in status_data:
            pct = (s['count'] / total_grievances * 100) if total_grievances > 0 else 0
            status_distribution.append({
                'label': s['label'],
                'value': s['count'],
                'pct': round(pct),
                'color': s['color']
            })

        # 4. Recent Activities (mix of submissions and status changes)
        recent_grievances = Grievance.objects.order_by('-created_at')[:3]
        recent_changes = GrievanceStatusHistory.objects.order_by('-timestamp')[:3]
        
        activities = []
        for g in recent_grievances:
            activities.append({
                'text': f"New Grievance '{g.title}' submitted",
                'sub': f"{g.category.name if g.category else 'General'} • {g.created_at.strftime('%b %d, %H:%M')}",
                'timestamp': g.created_at
            })
        for c in recent_changes:
            activities.append({
                'text': f"{c.changed_by.profile.full_name if hasattr(c.changed_by, 'profile') else 'System'} updated '{c.grievance.title}'",
                'sub': f"Status: {c.new_status} • {c.timestamp.strftime('%b %d, %H:%M')}",
                'timestamp': c.timestamp
            })
        
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        activities = activities[:5] # Keep only top 5

        return Response({
            'stats': [
                {'label': 'Total', 'value': str(total_grievances), 'icon': 'assignment', 'cls': 'total'},
                {'label': 'Pending', 'value': str(pending_grievances), 'icon': 'pending', 'cls': 'pending'},
                {'label': 'In Progress', 'value': str(in_progress_grievances), 'icon': 'autorenew', 'cls': 'inprogress'},
                {'label': 'Resolved', 'value': str(resolved_grievances), 'icon': 'check_circle', 'cls': 'resolved'},
                {'label': 'Rejected', 'value': str(rejected_grievances), 'icon': 'cancel', 'cls': 'rejected'},
            ],
            'categoryData': category_data,
            'statusDistribution': status_distribution,
            'activities': activities
        })

class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin user management endpoints.
    """
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperUserOrAdminRole]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(user_roles__role__name=role)
        return qs

    @action(detail=True, methods=['post'])
    def update_role(self, request, pk=None):
        user = self.get_object()
        new_roles = request.data.get('roles', []) # Expects list of role names e.g. ['staff', 'student']
        
        from accounts.models import Role, UserRole
        
        # Verify roles exist
        valid_roles = Role.objects.filter(name__in=new_roles)
        
        # Clear existing and set new
        UserRole.objects.filter(user=user).delete()
        for role in valid_roles:
            UserRole.objects.create(user=user, role=role)
            
        # Update is_staff flag for django admin access if necessary
        user.is_staff = 'staff' in new_roles or 'admin' in new_roles
        user.save()
        
        return Response({'status': 'roles updated'})

class AdminGrievanceViewSet(viewsets.ModelViewSet):
    """
    Admin grievance management endpoints.
    """
    queryset = Grievance.objects.all().order_by('-created_at')
    serializer_class = StaffGrievanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperUserOrAdminRole]

    @action(detail=True, methods=['post'])
    def assign_staff(self, request, pk=None):
        grievance = self.get_object()
        staff_id = request.data.get('staff_id')
        
        if not staff_id:
            return Response({'error': 'staff_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            staff_user = User.objects.get(id=staff_id)
            # Verify they are staff
            if not (staff_user.is_staff or staff_user.user_roles.filter(role__name='staff').exists()):
                return Response({'error': 'User is not a staff member'}, status=status.HTTP_400_BAD_REQUEST)
                
            grievance.assigned_staff = staff_user
            if grievance.status == 'open':
                old_status = grievance.status
                grievance.status = 'in_progress'
                GrievanceStatusHistory.objects.create(
                    grievance=grievance,
                    changed_by=request.user,
                    old_status=old_status,
                    new_status='in_progress',
                    note=f"Admin assigned this to {staff_user.email}."
                )
            grievance.save()
            return Response(StaffGrievanceSerializer(grievance, context={'request': request}).data)
        except User.DoesNotExist:
            return Response({'error': 'Staff user not found'}, status=status.HTTP_404_NOT_FOUND)
