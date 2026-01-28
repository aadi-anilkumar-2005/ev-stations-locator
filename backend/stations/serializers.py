from rest_framework import serializers
from .models import (
    Favorite, ChargerType, Amenity, StationAmenity, 
    Station, StationCharger, Brand, Showroom, ShowroomAmenity,
    ServiceCenter, ServiceAmenity
)

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'station', 'showroom', 'service_center', 'created_at']
        read_only_fields = ['user', 'created_at', 'station', 'showroom', 'service_center']

    def create(self, validated_data):
        return super().create(validated_data)

class StationChargerSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='charger_type.name')
    connector_type = serializers.CharField(source='charger_type.connector_type')
    max_power_kw = serializers.FloatField(source='charger_type.max_power_kw')
    
    class Meta:
        model = StationCharger
        fields = ['id', 'name', 'connector_type', 'max_power_kw', 'start_price', 'end_price', 'is_available']

class StationAmenitySerializer(serializers.ModelSerializer):
    amenity_name = serializers.CharField(source='amenity.name', read_only=True)
    
    class Meta:
        model = StationAmenity
        fields = ['amenity_name']

class StationSerializer(serializers.ModelSerializer):
    amenities = serializers.SerializerMethodField()
    station_chargers = StationChargerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Station
        fields = '__all__'
        
    def get_amenities(self, obj):
        return list(obj.station_amenities.values_list('amenity__name', flat=True))

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['brand_id', 'name']

class ShowroomAmenitySerializer(serializers.ModelSerializer):
    amenity_name = serializers.ReadOnlyField(source='amenity.name')

    class Meta:
        model = ShowroomAmenity
        fields = ['amenity_name']

class ShowroomSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    operator = serializers.ReadOnlyField(source='brand.name')
    amenities = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    
    class Meta:
        model = Showroom
        fields = '__all__'
        
    def get_amenities(self, obj):
        return list(obj.showroom_amenities.values_list('amenity__name', flat=True))

    def get_address(self, obj):
        return f"{obj.street_address or ''} {obj.city or ''}".strip()

class ServiceAmenitySerializer(serializers.ModelSerializer):
    amenity_name = serializers.ReadOnlyField(source='amenity.name')

    class Meta:
        model = ServiceAmenity
        fields = ['amenity_name']

class ServiceCenterSerializer(serializers.ModelSerializer):
    amenities = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    # Frontend expects specific flattened contact fields which are already in model (phone, email, website)
    # But it also expects 'operator' string and 'address'
    operator = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCenter
        fields = '__all__'

    def get_amenities(self, obj):
        return list(obj.service_amenities.values_list('amenity__name', flat=True))

    def get_address(self, obj):
        return f"{obj.street_address or ''} {obj.city or ''}".strip()

    def get_operator(self, obj):
        return "Service Center"

class MapStationSerializer(serializers.ModelSerializer):
    charger_types = serializers.SerializerMethodField()
    place_type = serializers.CharField(default='CHARGING')
    type = serializers.CharField(default='station')

    id = serializers.IntegerField(source='station_id')
    
    class Meta:
        model = Station
        fields = ['id', 'station_id', 'name', 'latitude', 'longitude', 'status', 'charger_types', 'place_type', 'type']
    
    def get_charger_types(self, obj):
        return list(obj.station_chargers.values_list('charger_type__name', flat=True).distinct())

class MapShowroomSerializer(serializers.ModelSerializer):
    place_type = serializers.CharField(default='SHOWROOM')
    type = serializers.CharField(default='showroom')
    
    id = serializers.IntegerField(source='showroom_id')

    class Meta:
        model = Showroom
        fields = ['id', 'showroom_id', 'name', 'latitude', 'longitude', 'status', 'place_type', 'type']

class MapServiceCenterSerializer(serializers.ModelSerializer):
    place_type = serializers.CharField(default='SERVICE')
    type = serializers.CharField(default='service_center')

    id = serializers.IntegerField(source='service_id')

    class Meta:
        model = ServiceCenter
        fields = ['id', 'service_id', 'name', 'latitude', 'longitude', 'status', 'place_type', 'type']
