from rest_framework import serializers
from .models import Place, Favorite, PlaceCharger

class PlaceChargerLinkSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='charger_type.name')
    connector_type = serializers.CharField(source='charger_type.connector_type')
    max_power_kw = serializers.FloatField(source='charger_type.max_power_kw')
    
    class Meta:
        model = PlaceCharger
        fields = ['id', 'name', 'connector_type', 'max_power_kw', 'start_price', 'end_price', 'is_available']

class PlaceSerializer(serializers.ModelSerializer):
    distance = serializers.FloatField(read_only=True, required=False)
    is_favorite = serializers.SerializerMethodField()
    is_fast_charging = serializers.BooleanField(read_only=True)
    navigation_url = serializers.SerializerMethodField()

    operator = serializers.StringRelatedField() # Show operator name
    charger_types = serializers.SerializerMethodField() # Keep for backward compat (list of strings)
    place_chargers = PlaceChargerLinkSerializer(many=True, read_only=True) # New detailed list
    amenities = serializers.SerializerMethodField() # JSONField now
    images = serializers.SerializerMethodField()
    power_kw = serializers.SerializerMethodField() # Max power
    price = serializers.SerializerMethodField() # Formatting helper
    available_count = serializers.SerializerMethodField()

    class Meta:
        model = Place
        fields = [
            'id', 'name', 'place_type', 'address', 'latitude', 'longitude', 
            'operator', 'opening_hours', 'status', 'created_at',
            'charger_types', 'place_chargers', 'amenities', 'images', 'power_kw', 'price',
            'distance', 'is_favorite', 'is_fast_charging', 'navigation_url',
            'available_count'
        ]

    def get_available_count(self, obj):
        # Count available PlaceCharger entries
        return obj.place_chargers.filter(is_available=True).count()

    def get_charger_types(self, obj):
        # Return unique list of charger types (names)
        return list(obj.place_chargers.values_list('charger_type__name', flat=True).distinct())

    def get_amenities(self, obj):
        return list(obj.amenities.values_list('name', flat=True))

    def get_images(self, obj):
        return list(obj.images.values_list('image_url', flat=True))

    def get_power_kw(self, obj):
        # Return max power available or 0 from ChargerType
        from django.db.models import Max
        return obj.place_chargers.aggregate(Max('charger_type__max_power_kw'))['charger_type__max_power_kw__max'] or 0.0

    def get_price(self, obj):
        # Return formatted price range or single price
        from django.db.models import Min, Max
        stats = obj.place_chargers.aggregate(Min('start_price'), Max('end_price'))
        min_p = stats['start_price__min']
        max_p = stats['end_price__max']
        
        if min_p is None:
            return "N/A"
        if min_p == max_p and min_p != 0:
             return f"${min_p:.2f}/kWh"
        if min_p == 0 and max_p == 0:
             return "Free"
             
        return f"${min_p:.2f} - ${max_p:.2f}/kWh"

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.favorites.filter(place=obj).exists()
        return False

    def get_navigation_url(self, obj):
        return f"https://www.google.com/maps/search/?api=1&query={obj.latitude},{obj.longitude}"

class FavoriteSerializer(serializers.ModelSerializer):
    place = PlaceSerializer(read_only=True)
    place_id = serializers.PrimaryKeyRelatedField(
        queryset=Place.objects.all(), source='place', write_only=True
    )

    class Meta:
        model = Favorite
        fields = ['id', 'place', 'place_id', 'created_at']
        
    def create(self, validated_data):
        user = self.context['request'].user
        place = validated_data['place']
        favorite, created = Favorite.objects.get_or_create(user=user, place=place)
        return favorite

class ShowroomDetailSerializer(serializers.ModelSerializer):
    operator = serializers.SerializerMethodField()
    amenities = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    distance = serializers.FloatField(read_only=True, required=False) # Keep if passed by annotation
    is_favorite = serializers.SerializerMethodField()
    
    class Meta:
        model = Place
        fields = [
            'id', 'name', 'place_type', 'address', 'latitude', 'longitude',
            'opening_hours', 'status', 'operator', 'amenities', 'images', 'distance', 'is_favorite'
        ]

    def get_operator(self, obj):
        if obj.operator:
            return {
                'name': obj.operator.name,
                'phone': obj.operator.contact_phone,
                'email': obj.operator.contact_email,
                'website': obj.operator.website
            }
        return None

    def get_amenities(self, obj):
        return list(obj.amenities.values_list('name', flat=True))

    def get_images(self, obj):
        return list(obj.images.values_list('image_url', flat=True))

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.favorites.filter(place=obj).exists()
        return False


class ServiceStationDetailSerializer(serializers.ModelSerializer):
    operator = serializers.SerializerMethodField()
    amenities = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    distance = serializers.FloatField(read_only=True, required=False)
    is_favorite = serializers.SerializerMethodField()
    
    class Meta:
        model = Place
        fields = [
            'id', 'name', 'place_type', 'address', 'latitude', 'longitude',
            'opening_hours', 'status', 'operator', 'amenities', 'images', 
            'distance', 'is_favorite'
        ]

    def get_operator(self, obj):
        if obj.operator:
            return {
                'name': obj.operator.name,
                'phone': obj.operator.contact_phone,
                'email': obj.operator.contact_email,
                'website': obj.operator.website
            }
        return None

    def get_amenities(self, obj):
        return list(obj.amenities.values_list('name', flat=True))

    def get_images(self, obj):
        return list(obj.images.values_list('image_url', flat=True))

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.favorites.filter(place=obj).exists()
        return False
