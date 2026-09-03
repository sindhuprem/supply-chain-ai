from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import TransporterProfile

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to JWT token payload
        token['user_id'] = str(user.id)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['company_name'] = user.company_name or ''

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'company_name': self.user.company_name,
            'phone': self.user.phone,
        }
        return data


class TransporterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransporterProfile
        fields = [
            'vehicle_type', 'vehicle_number', 'capacity_kg',
            'total_deliveries', 'on_time_deliveries', 'total_disruptions',
            'performance_score', 'is_available', 'current_latitude',
            'current_longitude', 'last_location_update'
        ]
        read_only_fields = ['performance_score', 'last_location_update']


class UserProfileSerializer(serializers.ModelSerializer):
    transporter_profile = TransporterProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'phone', 'company_name',
            'city', 'state', 'base_latitude', 'base_longitude',
            'fcm_token', 'is_active', 'created_at', 'transporter_profile'
        ]
        read_only_fields = ['id', 'role', 'created_at', 'is_active']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    vehicle_type = serializers.CharField(required=False, write_only=True, default='Heavy Truck')
    vehicle_number = serializers.CharField(required=False, write_only=True, default='')

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'role', 'phone',
            'company_name', 'city', 'state', 'base_latitude', 'base_longitude',
            'vehicle_type', 'vehicle_number'
        ]

    def create(self, validated_data):
        vehicle_type = validated_data.pop('vehicle_type', 'Heavy Truck')
        vehicle_number = validated_data.pop('vehicle_number', '')
        password = validated_data.pop('password')

        user = User.objects.create_user(password=password, **validated_data)

        if user.role == User.ROLE_TRANSPORTER:
            TransporterProfile.objects.create(
                user=user,
                vehicle_type=vehicle_type,
                vehicle_number=vehicle_number
            )

        return user
