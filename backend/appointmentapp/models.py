from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import DoctorManager
from cloudinary.models import CloudinaryField

class Doctor(AbstractUser):
    username = None
    email = models.EmailField(unique=True)

    specialty = models.CharField(max_length=100, blank=True)
    mild_illness = models.CharField(max_length=255, blank=True)
    symptoms = models.CharField(max_length=255, blank=True)
    availability_date = models.DateField(null=True, blank=True)
    availability_time = models.TimeField(null=True, blank=True)
    profile_picture = CloudinaryField('image', blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    clinic_address = models.CharField(max_length=255, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = DoctorManager()

    def __str__(self):
        return self.email

class Appointment(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("referred", "Referred"),
    )

    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient_name = models.CharField(max_length=150)
    patient_email = models.EmailField()
    mild_illness = models.CharField(max_length=255)
    symptoms = models.CharField(max_length=255)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient_name} - {self.doctor.email}"

class Patient(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.email
    
class Notification(models.Model):
    patient_email = models.EmailField()
    title = models.CharField(max_length=255)
    message = models.TextField()

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    clinic_address = models.TextField(null=True, blank=True)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.title

