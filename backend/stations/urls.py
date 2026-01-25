from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlaceViewSet, FavoriteViewSet, 
    nearby_places, search_places, filter_places, place_options,
    map_home, map_place_detail, map_search, ShowroomDetailView,
    ServiceStationDetailView
)

router = DefaultRouter()
# /api/favorites -> standard router
router.register(r'favorites', FavoriteViewSet, basename='favorite')
# /api/places/{id} -> standard router mostly, but we have specific listing paths differently.
# We can keep router for convenience of CRUD/Detail on /places/ID
router.register(r'places', PlaceViewSet, basename='place')

urlpatterns = [
    # Custom Place APIs
    path('places/nearby/', nearby_places, name='place_nearby'),
    path('places/search/', search_places, name='place_search'),
    path('places/filter/', filter_places, name='place_filter'),
    path('places/options/', place_options, name='place_options'),
    path('showrooms/<int:pk>/', ShowroomDetailView.as_view(), name='showroom_detail'),
    path('service-stations/<int:pk>/', ServiceStationDetailView.as_view(), name='service_station_detail'),

    
    # Map APIs
    path('map/home/', map_home, name='map_home'),
    path('map/place/<int:pk>/', map_place_detail, name='map_place_detail'),
    path('map/search/', map_search, name='map_search'),
    
    # Favorites custom separate routing
    path('favorites/add', FavoriteViewSet.as_view({'post': 'add'}), name='favorite_add'),
    path('favorites/remove', FavoriteViewSet.as_view({'delete': 'remove'}), name='favorite_remove'),
    
    path('', include(router.urls)),
]
