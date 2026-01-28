from django.db import models
from django.conf import settings
class Amenity(models.Model):
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('station', 'Station'),
        ('showroom', 'Showroom'),
        ('service', 'Service'),
    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='general'
    )

    class Meta:
        verbose_name_plural = "Amenities"

    def __str__(self):
        return self.name

class ChargerType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    connector_type = models.CharField(max_length=100, help_text="e.g. Type 2, CCS2, CHAdeMO")
    max_power_kw = models.FloatField(help_text="Max power output in kW")

    def __str__(self):
        return f"{self.name} ({self.connector_type}, {self.max_power_kw}kW)"

# New Stations
class Station(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('maintenance', 'Maintenance'),
        ('offline', 'Offline'),
    ]

    station_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    operator_name = models.CharField(max_length=100)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )

    opening_hours = models.CharField(max_length=100, blank=True, null=True)

    # Location data
    street_address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)

    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class StationAmenity(models.Model):
    station = models.ForeignKey(
        'Station',
        on_delete=models.CASCADE,
        db_column='station_id',
        related_name='station_amenities'
    )
    amenity = models.ForeignKey(
        'Amenity',
        on_delete=models.CASCADE,
        db_column='amenity_id'
    )

    class Meta:
        db_table = 'station_amenities'
        unique_together = ('station', 'amenity')

    def __str__(self):
        return f"{self.station} - {self.amenity}"

class StationCharger(models.Model):
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='station_chargers')
    charger_type = models.ForeignKey(ChargerType, on_delete=models.CASCADE, related_name='station_links')

    # Station specific details for this type
    start_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    end_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('station', 'charger_type')

    def __str__(self):
        return f"{self.charger_type.name} at {self.station.name}"

# Brands and Showrooms
class Brand(models.Model):
    brand_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class Showroom(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('renovation', 'Renovation'),
        ('closed', 'Closed'),
    ]

    showroom_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='showrooms')
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    
    opening_hours = models.CharField(max_length=100, blank=True, null=True)
    
    # Contact Info
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(max_length=150, blank=True, null=True)
    website = models.URLField(max_length=255, blank=True, null=True)
    
    # Location Data
    street_address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ShowroomAmenity(models.Model):
    showroom = models.ForeignKey(Showroom, on_delete=models.CASCADE, related_name='showroom_amenities')
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('showroom', 'amenity')

    def __str__(self):
        return f"{self.showroom} - {self.amenity}"

# Service Centers
class ServiceCenter(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('busy', 'Busy'),
        ('closed', 'Closed'),
    ]

    service_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    is_emergency_service = models.BooleanField(default=False)
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    
    opening_hours = models.CharField(max_length=100, blank=True, null=True)
    
    # Contact Info
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(max_length=150, blank=True, null=True)
    website = models.URLField(max_length=255, blank=True, null=True)
    
    # Location Data
    street_address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ServiceAmenity(models.Model):
    service = models.ForeignKey(ServiceCenter, on_delete=models.CASCADE, related_name='service_amenities')
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('service', 'amenity')

    def __str__(self):
        return f"{self.service} - {self.amenity}"

class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    showroom = models.ForeignKey(Showroom, on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    service_center = models.ForeignKey('ServiceCenter', on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'station', 'showroom', 'service_center')

    def __str__(self):
        return f"{self.user} -> {self.station or self.showroom or self.service_center}"
