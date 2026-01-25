from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes as api_permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django.db.models import Count, Q, F, FloatField, ExpressionWrapper
from django.db.models.functions import Cast
import math
from math import sin, cos, asin, sqrt, radians

from .models import Place, Favorite, PlaceCharger, ChargerType, Amenity
from .serializers import (
    PlaceSerializer, FavoriteSerializer, ShowroomDetailSerializer,
    ServiceStationDetailSerializer
)

def haversine(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 
    return c * r

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def place_options(request):
    # Get all unique charger types
    types = list(Place.objects.values_list('place_chargers__charger_type__name', flat=True).distinct())
    unique_types = sorted(list(set([t for t in types if t])))

    # Get all unique amenities (from M2M)
    amenities = list(Place.objects.values_list('amenities__name', flat=True).distinct())
    unique_amenities = sorted(list(set([a for a in amenities if a])))

    return Response({
        "charger_types": unique_types,
        "amenities": unique_amenities
    })



class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Place.objects.all()

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def nearby_places(request):
    lat = request.query_params.get('lat') or request.query_params.get('latitude')
    lng = request.query_params.get('lng') or request.query_params.get('longitude')
    dist_param = request.query_params.get('distance', 10) # default 10km
    
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
    
    places = list(Place.objects.all())
    nearby = []
    for p in places:
        d = haversine(lng, lat, p.longitude, p.latitude)
        if d <= limit_km:
            p.distance = d
            nearby.append(p)
    
    nearby.sort(key=lambda x: x.distance)
    serializer = PlaceSerializer(nearby, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def search_places(request):
    query = request.query_params.get('q') or request.query_params.get('query')
    if not query:
        return Response([])
        
    places = Place.objects.filter(name__icontains=query)
    serializer = PlaceSerializer(places, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def filter_places(request):
    queryset = Place.objects.all().prefetch_related('place_chargers', 'chargers', 'images', 'operator').distinct()
    
    # 1. Availability
    availability = request.query_params.get('availability')
    if availability == 'available':
        queryset = queryset.filter(status='ACTIVE')
    elif availability == '247':
        queryset = queryset.filter(opening_hours__icontains='24')

    # 2. Charger Type
    charger_type_param = request.query_params.get('charger_type')
    if charger_type_param:
        requested_types = [t.strip().lower() for t in charger_type_param.split(',') if t.strip()]
        q_objects = Q()
        for rt in requested_types:
            if rt == 'ac':
                q_objects |= Q(place_chargers__charger_type__name__icontains='AC') | Q(place_chargers__charger_type__name__icontains='Level 2')
            elif rt == 'dc':
                q_objects |= Q(place_chargers__charger_type__name__icontains='DC') | Q(place_chargers__charger_type__name__icontains='Fast') | Q(place_chargers__charger_type__name__icontains='CCS')
            elif rt == 'tesla':
                q_objects |= Q(place_chargers__charger_type__name__icontains='Tesla') | Q(place_chargers__charger_type__name__icontains='Supercharger')
            else:
                q_objects |= Q(place_chargers__charger_type__name__icontains=rt)
        
        if q_objects:
            queryset = queryset.filter(q_objects)

    # 3. Amenities
    amenities_param = request.query_params.get('amenities')
    if amenities_param:
        items = amenities_param.split(',')
        for item in items:
            item = item.strip()
            if not item: continue
            # Loose match for amenity name
            queryset = queryset.filter(amenities__name__icontains=item)

    # 5. Price (Filtering at DB level now possible!)
    price_min = request.query_params.get('price_min')
    price_max = request.query_params.get('price_max')
    
    if price_min:
        queryset = queryset.filter(place_chargers__start_price__gte=float(price_min))
    if price_max:
        queryset = queryset.filter(place_chargers__end_price__lte=float(price_max))

    # Convert to list for distance calc (cannot easily do geodistance in sqlite ORM without specialized libs)
    places = list(queryset.distinct())

    # 4. Location & Distance
    lat = request.query_params.get('lat') or request.query_params.get('latitude')
    lng = request.query_params.get('lng') or request.query_params.get('longitude')
    
    dist_param = request.query_params.get('distance')
    limit_miles = float(dist_param) if dist_param else None

    # Fallback to user location
    if (not lat or not lng) and request.user.is_authenticated:
        try:
            ul = request.user.userlocation
            lat = ul.latitude
            lng = ul.longitude
        except:
            pass

    filtered_places = []
    MILES_TO_KM = 1.60934

    for p in places:
        # Distance Logic
        p.distance = None
        if lat and lng:
            try:
                user_lat = float(lat)
                user_lng = float(lng)
                kms = haversine(user_lng, user_lat, p.longitude, p.latitude)
                dist_miles = kms / MILES_TO_KM
                p.distance = dist_miles
            except (ValueError, TypeError):
                pass
        
        if limit_miles is not None and p.distance is not None:
             if p.distance > limit_miles:
                 continue
        
        filtered_places.append(p)

    # 6. Sorting
    sort = request.query_params.get('sort')
    
    if sort == 'nearest':
        filtered_places.sort(key=lambda x: x.distance if x.distance is not None else 999999)
    elif sort == 'cheapest':
        # Need to re-calculate min price for sorting since we don't have it annotated yet
        filtered_places.sort(key=lambda x: min([c.start_price for c in x.place_chargers.all()] or [999]))
    elif sort == 'fastest':
        filtered_places.sort(key=lambda x: max([c.charger_type.max_power_kw for c in x.place_chargers.all()] or [0]), reverse=True)
        
    serializer = PlaceSerializer(filtered_places, many=True, context={'request': request})
    return Response(serializer.data)


# Map APIs
from rest_framework import serializers
class MapPlaceSerializer(serializers.ModelSerializer):
    charger_types = serializers.SerializerMethodField()

    class Meta:
        model = Place
        fields = ['id', 'name', 'latitude', 'longitude', 'charger_types', 'status', 'place_type']

    def get_charger_types(self, obj):
        return list(obj.place_chargers.values_list('charger_type__name', flat=True).distinct())

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def map_home(request):
    places = Place.objects.all()
    serializer = MapPlaceSerializer(places, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def map_place_detail(request, pk):
    try:
        place = Place.objects.get(pk=pk)
    except Place.DoesNotExist:
        return Response(status=404)
    serializer = MapPlaceSerializer(place)
    return Response(serializer.data)

@api_view(['GET'])
@api_permission_classes([permissions.AllowAny])
def map_search(request):
    query = request.query_params.get('q')
    if not query:
        return Response([])
    places = Place.objects.filter(name__icontains=query)
    serializer = MapPlaceSerializer(places, many=True)
    return Response(serializer.data)


class FavoriteViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FavoriteSerializer

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        # Fallback to user profile location if query param missing
        if (not lat or not lng) and request.user.is_authenticated:
            try:
                ul = request.user.userlocation
                lat = ul.latitude
                lng = ul.longitude
            except:
                pass

        results = list(queryset)

        if lat and lng:
            try:
                user_lat = float(lat)
                user_lng = float(lng)
                
                for fav in results:
                    place = fav.place
                    d = haversine(user_lng, user_lat, place.longitude, place.latitude)
                    # Hack: Attach distance to the place instance so serializer finds it
                    place.distance = d
            except (ValueError, TypeError):
                pass

        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        return self.create(request)
    
    @action(detail=False, methods=['delete'])
    def remove(self, request):
        place_id = request.data.get('place_id')
        Favorite.objects.filter(user=request.user, place_id=place_id).delete()
        return Response(status=204)

class ShowroomDetailView(generics.RetrieveAPIView):
    queryset = Place.objects.all()
    serializer_class = ShowroomDetailSerializer
    permission_classes = [AllowAny]


class ServiceStationDetailView(generics.RetrieveAPIView):
    queryset = Place.objects.filter(place_type='SERVICE')
    serializer_class = ServiceStationDetailSerializer
    permission_classes = [AllowAny]
