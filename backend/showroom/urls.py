from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('', views.ShowroomDashboardView.as_view(), name='admin-showroom-dashboard'),

    # Showrooms
    path('showrooms/', views.ShowroomListView.as_view(), name='admin-showroom-list'),
    path('showrooms/add/', views.ShowroomCreateView.as_view(), name='admin-showroom-add'),
    path('showrooms/<int:pk>/edit/', views.ShowroomUpdateView.as_view(), name='admin-showroom-edit'),
    path('showrooms/<int:pk>/delete/', views.ShowroomDeleteView.as_view(), name='admin-showroom-delete'),

    # Brands
    path('brands/', views.BrandListView.as_view(), name='admin-showroom-brand-list'),
    path('brands/add/', views.BrandCreateView.as_view(), name='admin-showroom-brand-add'),
    path('brands/<int:pk>/edit/', views.BrandUpdateView.as_view(), name='admin-showroom-brand-edit'),
    path('brands/<int:pk>/delete/', views.BrandDeleteView.as_view(), name='admin-showroom-brand-delete'),

    # Amenities
    path('amenities/', views.ShowroomAmenityListView.as_view(), name='admin-showroom-amenity-list'),
    path('amenities/add/', views.ShowroomAmenityCreateView.as_view(), name='admin-showroom-amenity-add'),
    path('amenities/<int:pk>/edit/', views.ShowroomAmenityUpdateView.as_view(), name='admin-showroom-amenity-edit'),
    path('amenities/<int:pk>/delete/', views.ShowroomAmenityDeleteView.as_view(), name='admin-showroom-amenity-delete'),
]
