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
        db_table = 'amenity_definitions'
        verbose_name_plural = "Amenities"

    def __str__(self):
        return self.name

class ChargerType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    connector_type = models.CharField(max_length=100, help_text="e.g. Type 2, CCS2, CHAdeMO")
    max_power_kw = models.FloatField(help_text="Max power output in kW")

    class Meta:
        db_table = 'ev_charger_standards'

    def __str__(self):
        return f"{self.name} ({self.connector_type}, {self.max_power_kw}kW)"

# Address Model
class Address(models.Model):
    street = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    zip_code = models.CharField(max_length=20)
    
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'physical_addresses'

    def __str__(self):
        return f"{self.street}, {self.city}"

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

    # Location data - Normalized
    address = models.ForeignKey(Address, on_delete=models.PROTECT, related_name='stations', null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'charging_stations'

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
        db_table = 'charging_station_amenities'
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
        db_table = 'station_charging_points'
        unique_together = ('station', 'charger_type')

    def __str__(self):
        return f"{self.charger_type.name} at {self.station.name}"

# Brands and Showrooms
class Brand(models.Model):
    brand_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        db_table = 'vehicle_brands'

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
    
    # Location Data - Normalized
    address = models.ForeignKey(Address, on_delete=models.PROTECT, related_name='showrooms', null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicle_showrooms'

    def __str__(self):
        return self.name

class ShowroomAmenity(models.Model):
    showroom = models.ForeignKey(Showroom, on_delete=models.CASCADE, related_name='showroom_amenities')
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE)

    class Meta:
        db_table = 'showroom_amenity_mappings'
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
    
    # Location Data - Normalized
    address = models.ForeignKey(Address, on_delete=models.PROTECT, related_name='service_centers', null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicle_service_centers'

    def __str__(self):
        return self.name

class ServiceAmenity(models.Model):
    service = models.ForeignKey(ServiceCenter, on_delete=models.CASCADE, related_name='service_amenities')
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE)

    class Meta:
        db_table = 'service_center_amenities'
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
        db_table = 'user_favorites'
        unique_together = ('user', 'station', 'showroom', 'service_center')

    def __str__(self):
        return f"{self.user} -> {self.station or self.showroom or self.service_center}"


# ── Booking ────────────────────────────────────────────────────────────────────
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone

class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    # Direct FK to Station — makes it easy to query "all bookings for station X"
    station = models.ForeignKey(
        'Station',
        on_delete=models.CASCADE,
        related_name='bookings',
        null=True,
        blank=True,
        help_text="The charging station this booking belongs to"
    )

    # FK to the specific charger type at that station
    station_charger = models.ForeignKey(
        'StationCharger',
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    duration_hours = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        help_text="Duration in hours"
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Total cost in INR"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='confirmed'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ev_bookings'
        ordering = ['-booking_date', '-start_time']
        indexes = [
            models.Index(fields=['booking_date']),
            models.Index(fields=['station_charger']),
            models.Index(fields=['station']),
            models.Index(fields=['user', 'status']),
        ]

    @classmethod
    def sync_statuses(cls):
        """
        Marks confirmed bookings as 'completed' if their end_time has passed.
        """
        now = timezone.localtime() if timezone.is_aware(timezone.now()) else timezone.now()
        current_date = now.date()
        current_time = now.time()

        # Update past dates
        cls.objects.filter(
            status='confirmed',
            booking_date__lt=current_date
        ).update(status='completed')

        # Update past times today
        cls.objects.filter(
            status='confirmed',
            booking_date=current_date,
            end_time__lte=current_time
        ).update(status='completed')

    def clean(self):
        """
        Validation rules:
        1. end_time must be after start_time.
        2. No time-slot overlap for the same charger.
        3. A user may only hold ONE confirmed booking per station at a time.
           To rebook, they must cancel their existing booking first.
        """
        # ── 1. Time sanity ──────────────────────────────────────────────────
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise DjangoValidationError("End time must be after start time.")

        # ── 2. Charger overlap → only compared against this station_charger ─
        if self.station_charger_id and self.booking_date and self.start_time and self.end_time:
            time_conflicts = Booking.objects.filter(
                station_charger=self.station_charger,
                booking_date=self.booking_date,
                status='confirmed',
                start_time__lt=self.end_time,
                end_time__gt=self.start_time,
            ).exclude(pk=self.pk)

            if time_conflicts.exists():
                raise DjangoValidationError(
                    "This time slot is already booked for this charger."
                )

        # ── 3. One active booking per user per station ───────────────────────
        if self.station_id and self.user_id:
            existing = Booking.objects.filter(
                user_id=self.user_id,
                station_id=self.station_id,
                status='confirmed',
            ).exclude(pk=self.pk)

            if existing.exists():
                raise DjangoValidationError(
                    "You already have an active booking at this station. "
                    "Please cancel it before making a new one."
                )

    def save(self, *args, **kwargs):
        # Auto-populate station from station_charger if not set
        if not self.station_id and self.station_charger_id:
            self.station_id = self.station_charger.station_id
        # Skip full_clean when only updating status (called with update_fields)
        update_fields = kwargs.get('update_fields')
        if update_fields is None or 'status' not in update_fields:
            self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking #{self.pk} – {self.station_charger} on {self.booking_date}"
