from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FavoriteViewSet, StationViewSet, ShowroomViewSet, ServiceCenterViewSet,
    nearby_places, search_places, place_options, filter_places,
    map_home, map_search
)

router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'stations', StationViewSet, basename='station')
router.register(r'showrooms', ShowroomViewSet, basename='showroom')
router.register(r'service-centers', ServiceCenterViewSet, basename='service-center')

urlpatterns = [
    # API endpoints matching frontend expectations
    path('places/nearby/', nearby_places, name='place_nearby'),
    path('places/filter/', filter_places, name='place_filter'),
    path('places/search/', search_places, name='place_search'),
    path('places/options/', place_options, name='place_options'),
    
    # Map APIs
    path('map/home/', map_home, name='map_home'),
    path('map/search/', map_search, name='map_search'),
    
    # Favorites extra actions
    path('favorites/add', FavoriteViewSet.as_view({'post': 'add'}), name='favorite_add'),
    path('favorites/remove', FavoriteViewSet.as_view({'delete': 'remove'}), name='favorite_remove'),
    
    path('', include(router.urls)),
]
