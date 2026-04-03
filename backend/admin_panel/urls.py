from django.urls import path
from django.views.generic import RedirectView
from .views import (
    AdminLoginView, AdminLogoutView, AdminDashboardView, 
    AdminShowroomsView, AdminAddShowroomView, AdminShowroomDetailView, AdminShowroomEditView, AdminShowroomDeleteView,
    AdminServiceCentersView, AdminAddServiceCenterView, AdminServiceCenterDetailView, AdminServiceCenterEditView, AdminServiceCenterDeleteView,
    AdminUsersView, AdminAddUserView, AdminEditUserView, AdminDeleteUserView, AdminSettingsView,
    AdminBrandsView, AdminAddBrandView, AdminEditBrandView, AdminDeleteBrandView
)

urlpatterns = [
    path('', RedirectView.as_view(pattern_name='admin-login', permanent=False), name='admin-root'),
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('logout/', AdminLogoutView.as_view(), name='admin-logout'),
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    
    # Stations (Migrated to charging_station)
    path('brands/', AdminBrandsView.as_view(), name='admin-brands'),
    path('brands/add/', AdminAddBrandView.as_view(), name='admin-add-brand'),
    path('brands/<int:pk>/edit/', AdminEditBrandView.as_view(), name='admin-brand-edit'),
    path('brands/<int:pk>/delete/', AdminDeleteBrandView.as_view(), name='admin-brand-delete'),

    path('showrooms/', AdminShowroomsView.as_view(), name='admin-showrooms'),
    path('showrooms/add/', AdminAddShowroomView.as_view(), name='admin-add-showroom'),
    path('showrooms/<int:pk>/', AdminShowroomDetailView.as_view(), name='admin-showroom-detail'),
    path('showrooms/<int:pk>/edit/', AdminShowroomEditView.as_view(), name='admin-showroom-edit'),
    path('showrooms/<int:pk>/delete/', AdminShowroomDeleteView.as_view(), name='admin-showroom-delete'),
    path('service-centers/', AdminServiceCentersView.as_view(), name='admin-service-centers'),
    path('service-centers/add/', AdminAddServiceCenterView.as_view(), name='admin-add-service-center'),
    path('service-centers/<int:pk>/', AdminServiceCenterDetailView.as_view(), name='admin-service-center-detail'),
    path('service-centers/<int:pk>/edit/', AdminServiceCenterEditView.as_view(), name='admin-service-center-edit'),
    path('service-centers/<int:pk>/delete/', AdminServiceCenterDeleteView.as_view(), name='admin-service-center-delete'),
    # Users
    path('users/', AdminUsersView.as_view(), name='admin-users'),
    path('users/add/', AdminAddUserView.as_view(), name='admin-add-user'),
    path('users/<int:pk>/edit/', AdminEditUserView.as_view(), name='admin-user-edit'),
    path('users/<int:pk>/delete/', AdminDeleteUserView.as_view(), name='admin-user-delete'),
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
]
