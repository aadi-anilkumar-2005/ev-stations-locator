from rest_framework import serializers
from .models import User, UserProfile, UserPreferences, UserNotificationSettings

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['profile_image', 'phone_number']

class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ['is_dark_mode', 'allow_location_tracking']

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotificationSettings
        fields = ['notify_charging_updates', 'notify_station_alerts', 'notify_promotional_offers', 'notify_app_updates']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()
    preferences = UserPreferencesSerializer()
    notifications = NotificationSettingsSerializer()
    
    current_latitude = serializers.SerializerMethodField()
    current_longitude = serializers.SerializerMethodField()
    last_location_update = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'middle_name', 'last_name', 'full_name', 'profile', 'preferences', 'notifications', 'current_latitude', 'current_longitude', 'last_location_update']
        read_only_fields = ['last_location_update']

    def update(self, instance, validated_data):
        # Handle Nested Updates
        profile_data = validated_data.pop('profile', None)
        preferences_data = validated_data.pop('preferences', None)
        notifications_data = validated_data.pop('notifications', None)

        # Update User fields
        if 'full_name' in validated_data:
            full_name = validated_data['full_name'].strip()
            # Name Parsing Logic
            parts = full_name.split()
            first_name = ""
            last_name = ""
            middle_name = ""

            if len(parts) == 1:
                first_name = parts[0]
            elif len(parts) == 2:
                first_name = parts[0]
                last_name = parts[-1]
            elif len(parts) >= 3:
                first_name = parts[0]
                last_name = parts[-1]
                middle_name = " ".join(parts[1:-1])
            
            instance.first_name = first_name
            instance.middle_name = middle_name
            instance.last_name = last_name
            instance.full_name = full_name
            
            # Remove full_name from validated_data to avoid double setting if iterating
            del validated_data['full_name']

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Profile
        if profile_data:
            for attr, value in profile_data.items():
                setattr(instance.profile, attr, value)
            instance.profile.save()

        # Update Preferences
        if preferences_data:
            for attr, value in preferences_data.items():
                setattr(instance.preferences, attr, value)
            instance.preferences.save()

        # Update Notifications
        if notifications_data:
            for attr, value in notifications_data.items():
                setattr(instance.notifications, attr, value)
            instance.notifications.save()

        return instance

    def get_current_latitude(self, obj):
        if hasattr(obj, 'userlocation'):
            return obj.userlocation.latitude
        return None

    def get_current_longitude(self, obj):
        if hasattr(obj, 'userlocation'):
            return obj.userlocation.longitude
        return None

    def get_last_location_update(self, obj):
        if hasattr(obj, 'userlocation'):
            return obj.userlocation.updated_at
        return None

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True, required=False)
    phone_number = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'first_name', 'last_name', 'phone_number']

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        
        full_name = validated_data.get('full_name', '').strip()
        first_name_input = validated_data.get('first_name', '').strip()
        last_name_input = validated_data.get('last_name', '').strip()

        # Fallback: if full_name is missing, try to construct it or use inputs
        if not full_name:
            if first_name_input:
                full_name = f"{first_name_input} {last_name_input}".strip()
            else:
                raise serializers.ValidationError({"full_name": "This field is required."})

        phone_number = validated_data.get('phone_number', '')

        # Name Parsing Logic
        parts = full_name.split()
        first_name = ""
        last_name = ""
        middle_name = ""

        if len(parts) == 1:
            first_name = parts[0]
        elif len(parts) == 2:
            first_name = parts[0]
            last_name = parts[-1]
        elif len(parts) >= 3:
            first_name = parts[0]
            last_name = parts[-1]
            middle_name = " ".join(parts[1:-1])

        # Generate a random internal username
        import uuid
        username = f"user_{uuid.uuid4().hex[:12]}"

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            full_name=full_name,
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
        )
        
        # Save phone number to profile
        if phone_number:
            # Signal should have created the profile
            if hasattr(user, 'profile'):
                user.profile.phone_number = phone_number
                user.profile.save()
            
        return user

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.EmailField()
        # Remove the default username field if it exists
        if 'username' in self.fields:
            del self.fields['username']

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
             raise AuthenticationFailed('Email and password are required.')
        
        # We need to explicitly check against the model
        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed('No active account found with the given credentials')

        if not user.check_password(password):
            raise AuthenticationFailed('No active account found with the given credentials')

        if not user.is_active:
            raise AuthenticationFailed('User account is disabled.')

        if user.is_superuser:
            raise AuthenticationFailed('No active account found with the given credentials')

        # Update last_login
        from django.contrib.auth.models import update_last_login
        update_last_login(None, user)

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username, # Keep internal username for reference if needed
                'full_name': user.full_name,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': getattr(user, 'profile', None).phone_number if hasattr(user, 'profile') else None,
            }
        }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        return token
