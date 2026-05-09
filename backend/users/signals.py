from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, UserProfile, UserPreferences, UserNotificationSettings

@receiver(post_save, sender=User)
def create_user_related_models(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        UserPreferences.objects.create(user=instance)
        UserNotificationSettings.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_related_models(sender, instance, **kwargs):
    # Ensure they exist (in case of legacy data or migration issues)
    # create_or_get returns (obj, created) tuple
    UserProfile.objects.get_or_create(user=instance)
    UserPreferences.objects.get_or_create(user=instance)
    UserNotificationSettings.objects.get_or_create(user=instance)
    
    # We don't strictly need to save them here unless we were modifying them
    # on the User instance itself, but since we split the models, changes
    # should be made directly to the related models.
