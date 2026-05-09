from rest_framework import serializers
from .models import (
    Favorite, ChargerType, Amenity, StationAmenity,
    Station, StationCharger, Brand, Showroom, ShowroomAmenity,
    ServiceCenter, ServiceAmenity, Address, Booking
)

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

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
    address = AddressSerializer(read_only=True)
    
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
    address = AddressSerializer(read_only=True)
    
    class Meta:
        model = Showroom
        fields = '__all__'
        
    def get_amenities(self, obj):
        return list(obj.showroom_amenities.values_list('amenity__name', flat=True))

class ServiceAmenitySerializer(serializers.ModelSerializer):
    amenity_name = serializers.ReadOnlyField(source='amenity.name')

    class Meta:
        model = ServiceAmenity
        fields = ['amenity_name']

class ServiceCenterSerializer(serializers.ModelSerializer):
    amenities = serializers.SerializerMethodField()
    address = AddressSerializer(read_only=True)
    # Frontend expects specific flattened contact fields which are already in model (phone, email, website)
    # But it also expects 'operator' string
    operator = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCenter
        fields = '__all__'

    def get_amenities(self, obj):
        return list(obj.service_amenities.values_list('amenity__name', flat=True))

    def get_operator(self, obj):
        return "Service Center"

class MapStationSerializer(serializers.ModelSerializer):
    charger_types = serializers.SerializerMethodField()
    place_type = serializers.CharField(default='CHARGING')
    type = serializers.CharField(default='station')

    id = serializers.IntegerField(source='station_id')
    latitude = serializers.DecimalField(source='address.latitude', max_digits=10, decimal_places=8, read_only=True)
    longitude = serializers.DecimalField(source='address.longitude', max_digits=11, decimal_places=8, read_only=True)
    
    class Meta:
        model = Station
        fields = ['id', 'station_id', 'name', 'latitude', 'longitude', 'status', 'charger_types', 'place_type', 'type']
    
    def get_charger_types(self, obj):
        return list(obj.station_chargers.values_list('charger_type__name', flat=True).distinct())

class MapShowroomSerializer(serializers.ModelSerializer):
    place_type = serializers.CharField(default='SHOWROOM')
    type = serializers.CharField(default='showroom')
    
    id = serializers.IntegerField(source='showroom_id')
    latitude = serializers.DecimalField(source='address.latitude', max_digits=10, decimal_places=8, read_only=True)
    longitude = serializers.DecimalField(source='address.longitude', max_digits=11, decimal_places=8, read_only=True)

    class Meta:
        model = Showroom
        fields = ['id', 'showroom_id', 'name', 'latitude', 'longitude', 'status', 'place_type', 'type']

class MapServiceCenterSerializer(serializers.ModelSerializer):
    place_type = serializers.CharField(default='SERVICE')
    type = serializers.CharField(default='service_center')

    id = serializers.IntegerField(source='service_id')
    latitude = serializers.DecimalField(source='address.latitude', max_digits=10, decimal_places=8, read_only=True)
    longitude = serializers.DecimalField(source='address.longitude', max_digits=11, decimal_places=8, read_only=True)

    class Meta:
        model = ServiceCenter
        fields = ['id', 'service_id', 'name', 'latitude', 'longitude', 'status', 'place_type', 'type']


# ── Booking Serializers ────────────────────────────────────────────────────────

class BookingSerializer(serializers.ModelSerializer):
    """Read serializer — includes nested station / charger summary."""
    station_name = serializers.CharField(source='station_charger.station.name', read_only=True)
    station_id = serializers.IntegerField(source='station.station_id', read_only=True)
    charger_name = serializers.CharField(source='station_charger.charger_type.name', read_only=True)
    connector_type = serializers.CharField(source='station_charger.charger_type.connector_type', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'station_id', 'station_name', 'station_charger',
            'charger_name', 'connector_type',
            'booking_date', 'start_time', 'end_time',
            'duration_hours', 'total_price', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'status']


class BookingCreateSerializer(serializers.ModelSerializer):
    """Write serializer — validates and creates a booking."""

    class Meta:
        model = Booking
        fields = [
            'station_charger', 'booking_date',
            'start_time', 'end_time',
            'duration_hours', 'total_price',
        ]

    def validate(self, data):
        sc = data.get('station_charger')
        date = data.get('booking_date')
        start = data.get('start_time')
        end = data.get('end_time')
        user = self.context['request'].user

        if start and end and start >= end:
            raise serializers.ValidationError("End time must be after start time.")

        if sc and date and start and end:
            # ── Check slot overlap ───────────────────────────────────────────
            conflicts = Booking.objects.filter(
                station_charger=sc,
                booking_date=date,
                status='confirmed',
                start_time__lt=end,
                end_time__gt=start,
            )
            if conflicts.exists():
                raise serializers.ValidationError(
                    "This time slot is already booked for this charger."
                )

        # ── One active booking per user per station ───────────────────────────
        if sc:
            station = sc.station
            existing = Booking.objects.filter(
                user=user,
                station=station,
                status='confirmed',
            )
            if existing.exists():
                raise serializers.ValidationError(
                    "You already have an active booking at this station. "
                    "Cancel it first before making a new one."
                )
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        sc = validated_data['station_charger']
        validated_data['user'] = user
        validated_data['station'] = sc.station   # populate direct FK
        validated_data['status'] = 'confirmed'
        return super().create(validated_data)


class AvailabilitySlotSerializer(serializers.Serializer):
    """Used to return booked start hours for a charger on a given date."""
    booked_slots = serializers.ListField(child=serializers.FloatField())
    charger_rate = serializers.DecimalField(max_digits=10, decimal_places=2)
    charger_name = serializers.CharField()
