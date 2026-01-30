from django.urls import path
from .views import (
    AdminLoginView, AdminLogoutView, AdminDashboardView, AdminStationsView, AdminAddStationView,
    AdminStationDetailView, AdminStationEditView, AdminStationDeleteView,
    AdminAmenitiesView, AdminAddAmenityView, AdminEditAmenityView, AdminDeleteAmenityView,
    AdminChargerTypesView, AdminAddChargerTypeView, AdminEditChargerTypeView, AdminDeleteChargerTypeView,
    AdminShowroomsView, AdminAddShowroomView, AdminShowroomDetailView, AdminShowroomEditView, AdminShowroomDeleteView,
    AdminServiceCentersView, AdminAddServiceCenterView, AdminServiceCenterDetailView, AdminServiceCenterEditView, AdminServiceCenterDeleteView,
    AdminUsersView, AdminAddUserView, AdminEditUserView, AdminDeleteUserView, AdminSettingsView,
    AdminBrandsView, AdminAddBrandView, AdminEditBrandView, AdminDeleteBrandView
)

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('logout/', AdminLogoutView.as_view(), name='admin-logout'),
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    
    # Stations
    path('stations/', AdminStationsView.as_view(), name='admin-stations'),
    path('stations/add/', AdminAddStationView.as_view(), name='admin-add-station'),
    path('stations/<int:pk>/', AdminStationDetailView.as_view(), name='admin-station-detail'),
    path('stations/<int:pk>/edit/', AdminStationEditView.as_view(), name='admin-station-edit'),
    path('stations/<int:pk>/delete/', AdminStationDeleteView.as_view(), name='admin-station-delete'),

    # Amenities
    path('amenities/', AdminAmenitiesView.as_view(), name='admin-amenities'),
    path('amenities/add/', AdminAddAmenityView.as_view(), name='admin-add-amenity'),
    path('amenities/<int:pk>/edit/', AdminEditAmenityView.as_view(), name='admin-amenity-edit'),
    path('amenities/<int:pk>/delete/', AdminDeleteAmenityView.as_view(), name='admin-amenity-delete'),

    # Charger Types
    path('charger-types/', AdminChargerTypesView.as_view(), name='admin-charger-types'),
    path('charger-types/add/', AdminAddChargerTypeView.as_view(), name='admin-add-charger-type'),
    path('charger-types/<int:pk>/edit/', AdminEditChargerTypeView.as_view(), name='admin-charger-type-edit'),
    path('charger-types/<int:pk>/edit/', AdminEditChargerTypeView.as_view(), name='admin-charger-type-edit'),
    path('charger-types/<int:pk>/delete/', AdminDeleteChargerTypeView.as_view(), name='admin-charger-type-delete'),

    # Brands
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
