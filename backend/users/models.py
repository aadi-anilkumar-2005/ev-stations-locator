from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
import uuid

class UserLocation(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='userlocation')
    latitude = models.FloatField()
    longitude = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_location_history'

    def __str__(self):
        return f"Location for {self.user.username}"

class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, default="")
    middle_name = models.CharField(max_length=255, blank=True)
    
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('station', 'Station Admin'),
        ('showroom', 'Showroom Admin'),
        ('service', 'Service Center'),
        ('customer', 'Customer'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')

    class Meta:
        db_table = 'platform_users'

    def __str__(self):
        return self.username


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_image = models.URLField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f"{self.user.username} Profile"


class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="preferences")

    # User Preferences
    is_dark_mode = models.BooleanField(default=False)
    allow_location_tracking = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_app_preferences'

    def __str__(self):
        return f"{self.user.username} Preferences"


class UserNotificationSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="notifications")

    # Notification Settings
    notify_charging_updates = models.BooleanField(default=True)
    notify_station_alerts = models.BooleanField(default=True)
    notify_promotional_offers = models.BooleanField(default=False)
    notify_app_updates = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_notification_configs'

    def __str__(self):
        return f"{self.user.username} Notifications"


class PartnerRegistration(models.Model):
    CATEGORY_CHOICES = [
        ('station', 'Charging Station'),
        ('showroom', 'EV Showroom'),
        ('service', 'Service Center'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    request_id = models.CharField(max_length=20, unique=True, blank=True)
    business_name = models.CharField(max_length=150)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    email = models.EmailField(max_length=100, unique=True)
    phone_number = models.CharField(max_length=20)
    password_hash = models.CharField(max_length=255)
    
    # Optional Fields
    gst_number = models.CharField(max_length=20, null=True, blank=True)
    document_url = models.FileField(upload_to='partner_docs/', null=True, blank=True) 
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    action_by_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='processed_registrations'
    )

    class Meta:
        db_table = 'partner_registrations'
        verbose_name = 'Partner Registration'
        verbose_name_plural = 'Partner Registrations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.business_name} ({self.request_id})"

    def save(self, *args, **kwargs):
        if not self.request_id:
            # Generate a unique request ID e.g., REQ-12345678
            self.request_id = f"REQ-{str(uuid.uuid4().int)[:8]}"
        super().save(*args, **kwargs)
