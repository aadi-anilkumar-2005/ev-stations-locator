from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.generic import TemplateView

from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from .models import User
from .serializers import UserSerializer, RegisterSerializer, ChangePasswordSerializer, ResetPasswordSerializer, EmailTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class RegisterView(generics.CreateAPIView):
    queryset = UserSerializer.Meta.model.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            # In a real app, send email here. 
            # For demo, just return success.
            return Response({"message": "Password reset link sent to email."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        # Taking a shortcut here since exact "token" flow needs email linkage.
        # We'll assume this verifies the token and sets new password.
        # For simplicity in this dummy backend, we'll just say "Done".
        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)

class LocationUpdateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        
        if lat is None or lng is None:
            return Response({"error": "Latitude and Longitude required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = request.user
        # Update or create UserLocation
        from .models import UserLocation
        loc, created = UserLocation.objects.get_or_create(user=user, defaults={'latitude': lat, 'longitude': lng})
        if not created:
            loc.latitude = lat
            loc.longitude = lng
            loc.save()
        
        return Response({"status": "Location updated"}, status=status.HTTP_200_OK)

class LocationCurrentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        user = request.user
        try:
            loc = user.userlocation
            return Response({
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "last_update": loc.updated_at
            })
        except AttributeError:
             return Response({
                "latitude": None,
                "longitude": None,
                "last_update": None
            })


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

# Admin Template Views
class AdminLoginView(TemplateView):
    template_name = 'admin/login.html'

class AdminDashboardView(TemplateView):
    template_name = 'admin/dashboard.html'

class AdminStationsView(TemplateView):
    template_name = 'admin/stations.html'

class AdminAddStationView(TemplateView):
    template_name = 'admin/add-station.html'

class AdminShowroomsView(TemplateView):
    template_name = 'admin/showrooms.html'

class AdminAddShowroomView(TemplateView):
    template_name = 'admin/add-showroom.html'

class AdminServiceCentersView(TemplateView):
    template_name = 'admin/service-centers.html'

class AdminAddServiceCenterView(TemplateView):
    template_name = 'admin/add-service-center.html'

class AdminUsersView(TemplateView):
    template_name = 'admin/users.html'

class AdminAnalyticsView(TemplateView):
    template_name = 'admin/analytics.html'

class AdminSettingsView(TemplateView):
    template_name = 'admin/settings.html'
