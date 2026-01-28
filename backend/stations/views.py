from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes as api_permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django.db.models import Count, Q, F, FloatField, ExpressionWrapper
from django.db.models.functions import Cast
import math
from math import sin, cos, asin, sqrt, radians

from .models import (
    Station, StationCharger, Brand, Showroom, ShowroomAmenity,
    ServiceCenter, ServiceAmenity,
    Favorite, ChargerType, Amenity
)
from .serializers import (
    FavoriteSerializer, StationSerializer, ShowroomSerializer, 
    ServiceCenterSerializer, MapStationSerializer, MapShowroomSerializer,
    MapServiceCenterSerializer
)

def haversine(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 
    return c * r

# Helper for Station normalization
def serialize_station(station, request=None):
    # Charger types names
    c_types = list(station.station_chargers.values_list('charger_type__name', flat=True).distinct())
    
    # Amenities
    amenities = list(station.station_amenities.values_list('amenity__name', flat=True))
    
    # Max power
    from django.db.models import Max
    max_kw = station.station_chargers.aggregate(Max('charger_type__max_power_kw'))['charger_type__max_power_kw__max'] or 0.0

    # formatting price
    from django.db.models import Min, Max as DbMax
    stats = station.station_chargers.aggregate(Min('start_price'), DbMax('end_price'))
    min_p = stats['start_price__min']
    max_p = stats['end_price__max']
    price_str = "N/A"
    if min_p is not None:
         if min_p == max_p and min_p != 0:
             price_str = f"${min_p:.2f}/kWh"
         elif min_p == 0 and max_p == 0:
             price_str = "Free"
         else:
             price_str = f"${min_p:.2f} - ${max_p:.2f}/kWh"

    # Place chargers details
    place_chargers = []
    for sc in station.station_chargers.all():
        place_chargers.append({
            'name': sc.charger_type.name,
            'connector_type': sc.charger_type.connector_type,
            'max_power_kw': sc.charger_type.max_power_kw,
            'start_price': sc.start_price,
            'end_price': sc.end_price,
            'is_available': sc.is_available
        })

    is_fav = False
    if request and request.user.is_authenticated:
        is_fav = Favorite.objects.filter(user=request.user, station=station).exists()
    
    return {
        'id': station.station_id,
        'name': station.name,
        'place_type': 'CHARGING', 
        'address': f"{station.street_address or ''}, {station.city or ''}, {station.state or ''} {station.zip_code or ''}".strip(),
        'latitude': float(station.latitude) if station.latitude else 0.0,
        'longitude': float(station.longitude) if station.longitude else 0.0,
        'operator': station.operator_name,
        'opening_hours': station.opening_hours,
        'status': station.status.upper(), 
        'created_at': station.created_at,
        'charger_types': c_types,
        'place_chargers': place_chargers,
        'amenities': amenities,
        'images': [],
        'power_kw': max_kw,
        'price': price_str,
        'distance': getattr(station, 'distance', None),
        'is_favorite': is_fav,
        'is_fast_charging': max_kw >= 50,
        'navigation_url': f"https://www.google.com/maps/search/?api=1&query={station.latitude},{station.longitude}",
        'available_count': station.station_chargers.filter(is_available=True).count(),
        'type': 'station'
    }

def serialize_showroom(showroom, request=None):
    amenities = list(showroom.showroom_amenities.values_list('amenity__name', flat=True))
    
    is_fav = False
    if request and request.user.is_authenticated:
        is_fav = Favorite.objects.filter(user=request.user, showroom=showroom).exists()

    return {
        'id': showroom.showroom_id,
        'name': showroom.name,
        'place_type': 'SHOWROOM',
        'address': f"{showroom.street_address or ''}, {showroom.city or ''}, {showroom.state or ''} {showroom.zip_code or ''}".strip(),
        'latitude': float(showroom.latitude) if showroom.latitude else 0.0,
        'longitude': float(showroom.longitude) if showroom.longitude else 0.0,
        'operator': showroom.brand.name if showroom.brand else "Unknown Brand",
        'opening_hours': showroom.opening_hours,
        'status': showroom.status.upper(), 
        'created_at': showroom.created_at,
        'amenities': amenities,
        'phone': showroom.phone,
        'email': showroom.email,
        'website': showroom.website,
        'images': [],
        'distance': getattr(showroom, 'distance', None),
        'is_favorite': is_fav,
        'navigation_url': f"https://www.google.com/maps/search/?api=1&query={showroom.latitude},{showroom.longitude}",
        'type': 'showroom'
    }

def serialize_service_center(service, request=None):
    amenities = list(service.service_amenities.values_list('amenity__name', flat=True))
    
    is_fav = False
    if request and request.user.is_authenticated:
        is_fav = Favorite.objects.filter(user=request.user, service_center=service).exists()

    return {
        'id': service.service_id,
        'name': service.name,
        'place_type': 'SERVICE',
        'address': f"{service.street_address or ''}, {service.city or ''}, {service.state or ''} {service.zip_code or ''}".strip(),
        'latitude': float(service.latitude) if service.latitude else 0.0,
        'longitude': float(service.longitude) if service.longitude else 0.0,
        'operator': "Service Center",
        'phone': service.phone,
        'email': service.email,
        'website': service.website,
        'opening_hours': service.opening_hours,
        'status': service.status.upper(), 
        'created_at': service.created_at,
        'amenities': amenities,
        'images': [],
        'distance': getattr(service, 'distance', None),
        'is_favorite': is_fav,
        'is_emergency': service.is_emergency_service,
        'navigation_url': f"https://www.google.com/maps/search/?api=1&query={service.latitude},{service.longitude}",
        'type': 'service_center'
    }

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def filter_places(request):
    # Params
    types = request.query_params.get('type', '').split(',') if request.query_params.get('type') else []
    charger_types = request.query_params.get('charger_type', '').split(',') if request.query_params.get('charger_type') else []
    amenities = request.query_params.get('amenities', '').split(',') if request.query_params.get('amenities') else []
    
    price_min = request.query_params.get('price_min')
    price_max = request.query_params.get('price_max')
    
    # Location
    lat = request.query_params.get('lat') or request.query_params.get('latitude')
    lng = request.query_params.get('lng') or request.query_params.get('longitude')
    dist_param = request.query_params.get('distance', 10)
    availability = request.query_params.get('availability')
    
    limit_km = float(dist_param)
    user_lat = float(lat) if lat else None
    user_lng = float(lng) if lng else None

    # Base Querysets
    stations_qs = Station.objects.all().prefetch_related('station_chargers__charger_type', 'station_amenities__amenity')
    showrooms_qs = Showroom.objects.all().select_related('brand').prefetch_related('showroom_amenities__amenity')
    services_qs = ServiceCenter.objects.all().prefetch_related('service_amenities__amenity')

    # Apply Filters
    
    # 1. Type Filter (if empty, include all)
    include_stations = not types or 'station' in types
    include_showrooms = not types or 'showroom' in types
    include_services = not types or 'service_center' in types

    # 2. Availability (Available Now) -> Only relevant for Stations typically
    if availability == 'available' and include_stations:
        # Filter stations that are 'ACTIVE' and have available chargers.
        # Assuming we can check status='ACTIVE'. 
        # For granular availability (station_chargers__is_available=True), we can annotate or filter.
        stations_qs = stations_qs.filter(status='ACTIVE')
        # Optional: check actual charger availability if model supports it easily.
        # simpler to just check status for now unless requested deeper.

    # 3. Charger Types (Stations only)
    if charger_types and include_stations:
        stations_qs = stations_qs.filter(station_chargers__charger_type__name__in=charger_types).distinct()

    # 4. Amenities (AND Logic - must have ALL selected)
    if amenities:
        if include_stations:
            for amenity in amenities:
                stations_qs = stations_qs.filter(station_amenities__amenity__name__iexact=amenity.strip())
            stations_qs = stations_qs.distinct()
            
        if include_showrooms:
            for amenity in amenities:
                showrooms_qs = showrooms_qs.filter(showroom_amenities__amenity__name__iexact=amenity)
            showrooms_qs = showrooms_qs.distinct()
            
        if include_services:
            for amenity in amenities:
                services_qs = services_qs.filter(service_amenities__amenity__name__iexact=amenity)
            services_qs = services_qs.distinct()

    # 5. Price (Stations only)
    if (price_min or price_max) and include_stations:
        if price_min:
             stations_qs = stations_qs.filter(station_chargers__start_price__gte=price_min)
        if price_max:
             stations_qs = stations_qs.filter(station_chargers__end_price__lte=price_max)
        stations_qs = stations_qs.distinct()

    # Apply Distance Filtering & Serialization
    combined_results = []

    if include_stations:
        for s in stations_qs:
            s_lat = float(s.latitude) if s.latitude else 0
            s_lng = float(s.longitude) if s.longitude else 0
            
            dist = None
            if user_lat and user_lng and s_lat and s_lng:
                dist = haversine(user_lng, user_lat, s_lng, s_lat)
                if dist > limit_km:
                    continue
            
            s.distance = dist
            combined_results.append(serialize_station(s, request))

    if include_showrooms:
        for sh in showrooms_qs:
            sh_lat = float(sh.latitude) if sh.latitude else 0
            sh_lng = float(sh.longitude) if sh.longitude else 0

            dist = None
            if user_lat and user_lng and sh_lat and sh_lng:
                dist = haversine(user_lng, user_lat, sh_lng, sh_lat)
                if dist > limit_km:
                    continue
            
            sh.distance = dist
            combined_results.append(serialize_showroom(sh, request))

    if include_services:
        for sc in services_qs:
            sc_lat = float(sc.latitude) if sc.latitude else 0
            sc_lng = float(sc.longitude) if sc.longitude else 0

            dist = None
            if user_lat and user_lng and sc_lat and sc_lng:
                dist = haversine(user_lng, user_lat, sc_lng, sc_lat)
                if dist > limit_km:
                    continue
            
            sc.distance = dist
            combined_results.append(serialize_service_center(sc, request))

    # Sort by distance
    combined_results.sort(key=lambda x: x['distance'] if x['distance'] is not None else 99999)
    
    return Response(combined_results)

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def nearby_places(request):
    lat = request.query_params.get('lat') or request.query_params.get('latitude')
    lng = request.query_params.get('lng') or request.query_params.get('longitude')
    dist_param = request.query_params.get('distance', 10) 
    
    if not lat or not lng:
        if request.user.is_authenticated:
            try:
                ul = request.user.userlocation
                lat = ul.latitude
                lng = ul.longitude
            except:
                 pass
        
        if not lat or not lng:
            return Response({"error": "Latitude and Longitude required"}, status=400)
            
    lat = float(lat)
    lng = float(lng)
    limit_km = float(dist_param)
    
    # Stations
    stations = list(Station.objects.all().prefetch_related('station_chargers__charger_type', 'station_amenities__amenity'))
    
    # Showrooms
    showrooms = list(Showroom.objects.all().select_related('brand').prefetch_related('showroom_amenities__amenity'))

    # Service Centers
    services = list(ServiceCenter.objects.all().prefetch_related('service_amenities__amenity'))

    combined_results = []
    
    for s in stations:
        if s.latitude and s.longitude:
            d = haversine(lng, lat, float(s.longitude), float(s.latitude))
            if d <= limit_km:
                s.distance = d
                serialized = serialize_station(s, request)
                combined_results.append(serialized)

    for sh in showrooms:
        if sh.latitude and sh.longitude:
            d = haversine(lng, lat, float(sh.longitude), float(sh.latitude))
            if d <= limit_km:
                sh.distance = d
                serialized = serialize_showroom(sh, request)
                combined_results.append(serialized)

    for sc in services:
        if sc.latitude and sc.longitude:
            d = haversine(lng, lat, float(sc.longitude), float(sc.latitude))
            if d <= limit_km:
                sc.distance = d
                serialized = serialize_service_center(sc, request)
                combined_results.append(serialized)
    
    combined_results.sort(key=lambda x: x['distance'] if x['distance'] is not None else 99999)
    return Response(combined_results)

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def search_places(request):
    query = request.query_params.get('q') or request.query_params.get('query')
    if not query:
        return Response([])
        
    stations = Station.objects.filter(name__icontains=query)
    stations_data = [serialize_station(s, request) for s in stations]

    showrooms = Showroom.objects.filter(name__icontains=query)
    showrooms_data = [serialize_showroom(sh, request) for sh in showrooms]

    services = ServiceCenter.objects.filter(name__icontains=query)
    services_data = [serialize_service_center(sc, request) for sc in services]

    return Response(stations_data + showrooms_data + services_data)

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def map_home(request):     
    stations = Station.objects.all().prefetch_related('station_chargers__charger_type')
    station_results = MapStationSerializer(stations, many=True).data

    showrooms = Showroom.objects.all()
    showroom_results = MapShowroomSerializer(showrooms, many=True).data

    services = ServiceCenter.objects.all()
    service_results = MapServiceCenterSerializer(services, many=True).data

    return Response(station_results + showroom_results + service_results)

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def map_search(request):
    return search_places(request) # Reuse search logic

class FavoriteViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FavoriteSerializer

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        results = []
        for fav in queryset:
            place_data = None
            if fav.station:
                place_data = serialize_station(fav.station, request)
            elif fav.showroom:
                place_data = serialize_showroom(fav.showroom, request)
            elif fav.service_center:
                place_data = serialize_service_center(fav.service_center, request)
            
            if place_data:
                results.append({
                    'id': fav.id,
                    'created_at': fav.created_at,
                    'place': place_data
                })
                
        return Response(results)

    @action(detail=False, methods=['post'])
    def add(self, request):
        # Expect station_id, showroom_id, or service_id
        station_id = request.data.get('station_id') or request.query_params.get('station_id')
        showroom_id = request.data.get('showroom_id') or request.query_params.get('showroom_id')
        service_id = request.data.get('service_id') or request.query_params.get('service_id')
        
        if not station_id and not showroom_id and not service_id:
             return Response({"error": "Provide station_id, showroom_id, or service_id"}, status=400)
        
        fav = None
        if station_id:
            station = Station.objects.get(pk=station_id)
            fav, _ = Favorite.objects.get_or_create(user=request.user, station=station)
        elif showroom_id:
            showroom = Showroom.objects.get(pk=showroom_id)
            fav, _ = Favorite.objects.get_or_create(user=request.user, showroom=showroom)
        elif service_id:
            service = ServiceCenter.objects.get(pk=service_id)
            fav, _ = Favorite.objects.get_or_create(user=request.user, service_center=service)
            
        return Response(FavoriteSerializer(fav).data, status=201)
    
    @action(detail=False, methods=['delete'])
    def remove(self, request):
        station_id = request.data.get('station_id') or request.query_params.get('station_id')
        showroom_id = request.data.get('showroom_id') or request.query_params.get('showroom_id')
        service_id = request.data.get('service_id') or request.query_params.get('service_id')
        
        if station_id:
            Favorite.objects.filter(user=request.user, station_id=station_id).delete()
        elif showroom_id:
            Favorite.objects.filter(user=request.user, showroom_id=showroom_id).delete()
        elif service_id:
            Favorite.objects.filter(user=request.user, service_center_id=service_id).delete()
            
        return Response(status=204)

class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = serialize_station(instance, request)
        return Response(data)

class ShowroomViewSet(viewsets.ModelViewSet):
    queryset = Showroom.objects.all()
    serializer_class = ShowroomSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = serialize_showroom(instance, request)
        return Response(data)

class ServiceCenterViewSet(viewsets.ModelViewSet):
    queryset = ServiceCenter.objects.all()
    serializer_class = ServiceCenterSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = serialize_service_center(instance, request)
        return Response(data)

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def place_options(request):
    charger_types = ChargerType.objects.values_list('name', flat=True).distinct()
    # Return list of {name, category} for amenities
    amenities = Amenity.objects.values('name', 'category').distinct()
    return Response({
        "charger_types": list(charger_types), 
        "amenities": list(amenities)
    })
