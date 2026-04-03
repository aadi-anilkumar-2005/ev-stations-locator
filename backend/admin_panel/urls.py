from django.urls import path
from django.views.generic import RedirectView
from .views import (
    AdminLoginView, AdminLogoutView, AdminDashboardView, 
    AdminShowroomsView, AdminShowroomDetailView, AdminShowroomDeleteView,
    AdminServiceCentersView, AdminServiceCenterDetailView, AdminServiceCenterDeleteView,
    AdminUsersView, AdminAddUserView, AdminEditUserView, AdminDeleteUserView, AdminSettingsView,
    AdminStationsView, AdminStationDetailView, AdminStationDeleteView
)

urlpatterns = [
    path('', RedirectView.as_view(pattern_name='admin-login', permanent=False), name='admin-root'),
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('logout/', AdminLogoutView.as_view(), name='admin-logout'),
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    
    # Stations
    path('stations/', AdminStationsView.as_view(), name='admin-stations'),
    path('stations/<int:pk>/', AdminStationDetailView.as_view(), name='admin-station-detail'),
    path('stations/<int:pk>/delete/', AdminStationDeleteView.as_view(), name='admin-station-delete'),

    # Showrooms
    path('showrooms/', AdminShowroomsView.as_view(), name='admin-showrooms'),
    path('showrooms/<int:pk>/', AdminShowroomDetailView.as_view(), name='admin-showroom-detail'),
    path('showrooms/<int:pk>/delete/', AdminShowroomDeleteView.as_view(), name='admin-showroom-delete'),
    
    # Service Centers
    path('service-centers/', AdminServiceCentersView.as_view(), name='admin-service-centers'),
    path('service-centers/<int:pk>/', AdminServiceCenterDetailView.as_view(), name='admin-service-center-detail'),
    path('service-centers/<int:pk>/delete/', AdminServiceCenterDeleteView.as_view(), name='admin-service-center-delete'),
    
    # Users
    path('users/', AdminUsersView.as_view(), name='admin-users'),
    path('users/add/', AdminAddUserView.as_view(), name='admin-add-user'),
    path('users/<int:pk>/edit/', AdminEditUserView.as_view(), name='admin-user-edit'),
    path('users/<int:pk>/delete/', AdminDeleteUserView.as_view(), name='admin-user-delete'),
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
]
