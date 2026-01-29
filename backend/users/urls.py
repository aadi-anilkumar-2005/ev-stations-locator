from django.urls import path
from .views import (
    RegisterView, LogoutView, ForgotPasswordView, ResetPasswordView, 
    LocationUpdateView, LocationCurrentView, ProfileView, EmailTokenObtainPairView,
    AdminLoginView, AdminDashboardView, AdminStationsView, AdminAddStationView,
    AdminShowroomsView, AdminAddShowroomView, AdminServiceCentersView,
    AdminAddServiceCenterView, AdminUsersView, AdminAnalyticsView, AdminSettingsView
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

    # Admin URLs
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/stations/', AdminStationsView.as_view(), name='admin-stations'),
    path('admin/stations/add/', AdminAddStationView.as_view(), name='admin-add-station'),
    path('admin/showrooms/', AdminShowroomsView.as_view(), name='admin-showrooms'),
    path('admin/showrooms/add/', AdminAddShowroomView.as_view(), name='admin-add-showroom'),
    path('admin/service-centers/', AdminServiceCentersView.as_view(), name='admin-service-centers'),
    path('admin/service-centers/add/', AdminAddServiceCenterView.as_view(), name='admin-add-service-center'),
    path('admin/users/', AdminUsersView.as_view(), name='admin-users'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('admin/settings/', AdminSettingsView.as_view(), name='admin-settings'),
]
