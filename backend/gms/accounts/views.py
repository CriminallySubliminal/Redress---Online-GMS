from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import UserSerializer, RegisterSerializer, PublicUserSerializer, ChangePasswordSerializer
from .permissions import IsSelfOrAdmin
from .utils import send_verification_email, verify_token

from django_filters.rest_framework import DjangoFilterBackend

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            try:
                send_verification_email(user)
            except Exception as e:
                # Log error in real app, but don't fail registration
                print(f"Failed to send verification email: {e}")
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"detail": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user_id = verify_token(token, max_age=1800) # 30 minutes
        
        if user_id == 'expired':
            return Response({"detail": "Verification link has expired"}, status=status.HTTP_400_BAD_REQUEST)
        elif user_id == 'invalid':
            return Response({"detail": "Invalid verification link"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(id=user_id)
            if user.is_verified:
                return Response({"detail": "Email is already verified"}, status=status.HTTP_200_OK)
                
            user.is_verified = True
            user.save()
            
            response_data = {"detail": "Email successfully verified"}
            
            # If staff, provide tokens for auto-login
            if getattr(user, 'is_staff', False):
                refresh = RefreshToken.for_user(user)
                response_data['tokens'] = {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            
            return Response(response_data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class ResendVerificationEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_verified:
            return Response({"detail": "Email is already verified"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            send_verification_email(user)
            return Response({"detail": "Verification email resent successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSelfOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = []

    def get_serializer_class(self):
        if self.action == 'list' or (self.action == 'retrieve' and self.kwargs.get('pk') != str(self.request.user.id)):
            if not (self.request.user.is_staff or self.request.user.is_superuser):
                return PublicUserSerializer
        return UserSerializer

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(user_roles__role__name=role)
            
        return queryset.distinct()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data.get('old_password')):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data.get('new_password'))
            user.save()
            return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Block unverified staff members from logging in
        if getattr(self.user, 'is_staff', False) and not getattr(self.user, 'is_verified', False):
            raise AuthenticationFailed("Staff members must verify their email before logging in. Please check your inbox.")
            
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
