from django.urls import path
from .views import (
    RegisterView, LogoutView, ForgotPasswordView, ResetPasswordView, 
    LocationUpdateView, LocationCurrentView, ProfileView, EmailTokenObtainPairView
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('location/update/', LocationUpdateView.as_view(), name='location_update'),
    path('location/current/', LocationCurrentView.as_view(), name='location_current'),
    path('profile/', ProfileView.as_view(), name='user_profile'),


]
