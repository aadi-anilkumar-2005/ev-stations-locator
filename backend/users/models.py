from django.contrib.auth.models import AbstractUser
from django.db import models

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
