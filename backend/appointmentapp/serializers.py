from rest_framework import serializers
from .models import Doctor
from .models import Appointment, Patient

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
    profile_picture = serializers.SerializerMethodField()

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

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.build_url()
        return None

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"

class PatientRegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = Patient
        fields = ['first_name', 'last_name', 'email', 'password', 'confirm_password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')

        # Prevent duplicate email crash
        if Patient.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({"email": "Email already registered."})

        return Patient.objects.create(**validated_data)


class PatientLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

