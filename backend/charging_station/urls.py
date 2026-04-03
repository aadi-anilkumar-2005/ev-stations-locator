from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('', views.CSDashboardView.as_view(), name='admin-cs-dashboard'),

    # Stations
    path('stations/', views.CSStationListView.as_view(), name='admin-cs-stations'),
    path('stations/add/', views.CSStationCreateView.as_view(), name='admin-cs-station-add'),
    path('stations/<int:pk>/edit/', views.CSStationUpdateView.as_view(), name='admin-cs-station-edit'),
    path('stations/<int:pk>/delete/', views.CSStationDeleteView.as_view(), name='admin-cs-station-delete'),

    # Charger Types
    path('charger-types/', views.CSChargerTypeListView.as_view(), name='admin-cs-chargers'),
    path('charger-types/add/', views.CSChargerTypeCreateView.as_view(), name='admin-cs-charger-add'),
    path('charger-types/<int:pk>/edit/', views.CSChargerTypeUpdateView.as_view(), name='admin-cs-charger-edit'),
    path('charger-types/<int:pk>/delete/', views.CSChargerTypeDeleteView.as_view(), name='admin-cs-charger-delete'),

    # Amenities
    path('amenities/', views.CSAmenityListView.as_view(), name='admin-cs-amenities'),
    path('amenities/add/', views.CSAmenityCreateView.as_view(), name='admin-cs-amenity-add'),
    path('amenities/<int:pk>/edit/', views.CSAmenityUpdateView.as_view(), name='admin-cs-amenity-edit'),
    path('amenities/<int:pk>/delete/', views.CSAmenityDeleteView.as_view(), name='admin-cs-amenity-delete'),
]
