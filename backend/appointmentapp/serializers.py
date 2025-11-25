from rest_framework import serializers
from .models import Doctor
from .models import Appointment

class DoctorRegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    class Meta:
        model = Doctor
        fields = [
            'first_name', 'last_name', 'email', 'specialty',
            'mild_illness', 'symptoms', 'availability_date',
            'availability_time', 'password', 'confirm_password'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        pwd = data.get('password')
        cpwd = data.get('confirm_password')
        if not pwd or not cpwd:
            raise serializers.ValidationError({"password": "Password and confirm_password are required."})
        if pwd != cpwd:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')

        user = Doctor.objects.create_user(
            password=password,
            **validated_data
        )
        return user



# Serializer used for listing/searching doctors (read-only)
class DoctorListSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'specialty',
            'mild_illness',
            'symptoms',
            'availability_date',
            'availability_time',
            'profile_picture'
        ]

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"
