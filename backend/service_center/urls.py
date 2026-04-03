from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('', views.ServiceCenterDashboardView.as_view(), name='service-center-portal'),

    # Locations
    path('locations/', views.ServiceLocationsListView.as_view(), name='service-locations-list'),
    path('locations/add/', views.ServiceLocationCreateView.as_view(), name='service-location-add'),
    path('locations/<int:pk>/edit/', views.ServiceLocationUpdateView.as_view(), name='service-location-edit'),
    path('locations/<int:pk>/delete/', views.ServiceLocationDeleteView.as_view(), name='service-location-delete'),

    # Amenities
    path('amenities/', views.ServiceAmenitiesListView.as_view(), name='service-amenities-list'),
    path('amenities/add/', views.ServiceAmenityCreateView.as_view(), name='service-amenity-add'),
    path('amenities/<int:pk>/edit/', views.ServiceAmenityUpdateView.as_view(), name='service-amenity-edit'),
    path('amenities/<int:pk>/delete/', views.ServiceAmenityDeleteView.as_view(), name='service-amenity-delete'),
]
