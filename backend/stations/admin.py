from django.contrib import admin
from .models import (
    Amenity, Station, StationCharger, StationAmenity,
    ChargerType, Favorite, Brand, Showroom, ShowroomAmenity,
    ServiceCenter, ServiceAmenity, Address
)

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('street', 'city', 'state', 'zip_code')
    search_fields = ('street', 'city', 'zip_code')

@admin.register(ChargerType)
class ChargerTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'connector_type', 'max_power_kw')

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)

# Favorites
@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'station', 'showroom', 'service_center', 'created_at')

# Station Admin
from .models import Station, StationAmenity, StationCharger

class StationChargerInline(admin.TabularInline):
    model = StationCharger
    extra = 1

class StationAmenityInline(admin.TabularInline):
    model = StationAmenity
    extra = 1

@admin.register(StationCharger)
class StationChargerAdmin(admin.ModelAdmin):
    list_display = ('station', 'charger_type', 'start_price', 'end_price', 'is_available')
    list_filter = ('charger_type', 'station')
    search_fields = ('station__name', 'charger_type__name')

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('name', 'operator_name', 'status', 'get_city', 'get_state')
    list_filter = ('status', 'address__state')
    search_fields = ('name', 'operator_name', 'address__street')
    
    def get_city(self, obj):
        return obj.address.city if obj.address else '-'
    get_city.short_description = 'City'

    def get_state(self, obj):
        return obj.address.state if obj.address else '-'
    get_state.short_description = 'State'

# Showroom Admin
from .models import Brand, Showroom, ShowroomAmenity

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name',)

# Service Center Admin
class ServiceAmenityInline(admin.TabularInline):
    model = ServiceAmenity
    extra = 1

@admin.register(ServiceCenter)
class ServiceCenterAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_emergency_service', 'status', 'get_city', 'get_state')
    list_filter = ('is_emergency_service', 'status', 'address__state')
    search_fields = ('name', 'address__city')
    inlines = [ServiceAmenityInline]
    
    def get_city(self, obj):
        return obj.address.city if obj.address else '-'
    get_city.short_description = 'City'

    def get_state(self, obj):
        return obj.address.state if obj.address else '-'
    get_state.short_description = 'State'

class ShowroomAmenityInline(admin.TabularInline):
    model = ShowroomAmenity
    extra = 1

@admin.register(Showroom)
class ShowroomAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'status', 'get_city', 'get_state')
    list_filter = ('brand', 'status', 'address__city')
    search_fields = ('name', 'brand__name', 'address__city')
    inlines = [ShowroomAmenityInline]

    def get_city(self, obj):
        return obj.address.city if obj.address else '-'
    get_city.short_description = 'City'

    def get_state(self, obj):
        return obj.address.state if obj.address else '-'
    get_state.short_description = 'State'
