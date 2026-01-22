from rest_framework import generics
from .models import Doctor, Appointment
from .serializers import DoctorRegisterSerializer, DoctorListSerializer, AppointmentSerializer
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.core.mail import send_mail
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Patient, Notification
from .serializers import PatientRegisterSerializer, PatientLoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import DoctorTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.conf import settings
from .permissions import IsAuthenticatedPatient

class DoctorRegisterView(generics.CreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorRegisterSerializer


class DoctorListView(generics.ListAPIView):
    """
    GET /api/doctors/?mild_illness=<>&symptoms=<>&availability_date=<YYYY-MM-DD>&availability_time=<HH:MM>
    Returns doctors that match by mild_illness OR symptoms (case-insensitive contains).
    Optional filtering by availability_date and availability_time.
    """
    permission_classes = [] 
    serializer_class = DoctorListSerializer
    queryset = Doctor.objects.filter(is_active=True)

    def get_queryset(self):
        qs = super().get_queryset()
        mild_illness = self.request.query_params.get('mild_illness')
        symptoms = self.request.query_params.get('symptoms')
        availability_date = self.request.query_params.get('availability_date')
        availability_time = self.request.query_params.get('availability_time')

        if mild_illness and symptoms:
            qs = qs.filter(
                Q(mild_illness__icontains=mild_illness) |
                Q(symptoms__icontains=symptoms)
            )

        elif mild_illness:
            qs = qs.filter(mild_illness__icontains=mild_illness)
        elif symptoms:
            qs = qs.filter(symptoms__icontains=symptoms)

        if availability_date:
            qs = qs.filter(availability_date=availability_date)
        if availability_time:
            qs = qs.filter(availability_time=availability_time)

        return qs.order_by('availability_date', 'availability_time')
    
class DoctorStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user
        today = timezone.now().date()

        total_appointments = Appointment.objects.filter(doctor=doctor).count()

        today_appointments = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=today
        ).count()

        pending_appointments = Appointment.objects.filter(
            doctor=doctor,
            status="pending"
        ).count()

        patients = Appointment.objects.filter(
            doctor=doctor
        ).values("patient_email").distinct().count()

        return Response({
            "today": today_appointments,
            "patients": patients,
            "pending": pending_appointments,
            "total": total_appointments
        })

    
class DoctorProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        doctor = request.user
        return Response({
            "first_name": doctor.first_name,
            "last_name": doctor.last_name,
            "email": doctor.email,
            "specialty": doctor.specialty,
            "mild_illness": doctor.mild_illness,
            "symptoms": doctor.symptoms,
            "availability_date": doctor.availability_date,
            "availability_time": doctor.availability_time,
            "profile_picture": doctor.profile_picture.url if doctor.profile_picture else None,
            "latitude": doctor.latitude,
            "longitude": doctor.longitude,
            "clinic_address": doctor.clinic_address,
        })

    def put(self, request):
        doctor = request.user

        try:
            doctor.first_name = request.data.get("first_name", doctor.first_name)
            doctor.last_name = request.data.get("last_name", doctor.last_name)
            doctor.email = request.data.get("email", doctor.email)
            doctor.mild_illness = request.data.get("mild_illness", doctor.mild_illness)
            doctor.symptoms = request.data.get("symptoms", doctor.symptoms)
            doctor.latitude = request.data.get("latitude", doctor.latitude)
            doctor.longitude = request.data.get("longitude", doctor.longitude)
            doctor.clinic_address = request.data.get("clinic_address", doctor.clinic_address)
            doctor.specialty = request.data.get("specialty", doctor.specialty)
            doctor.availability_date = request.data.get("availability_date", doctor.availability_date)
            doctor.availability_time = request.data.get("availability_time", doctor.availability_time)


            if request.data.get("availability_date"):
                doctor.availability_date = request.data.get("availability_date")

            if request.data.get("availability_time"):
                doctor.availability_time = request.data.get("availability_time")

            if 'profile_picture' in request.FILES:
                doctor.profile_picture = request.FILES['profile_picture']

            doctor.save()

            return Response({
                "message": "Profile updated successfully",
                "profile_picture": doctor.profile_picture.url if doctor.profile_picture else None
            }, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class CreateAppointmentView(generics.CreateAPIView):
    serializer_class = AppointmentSerializer


class DoctorAppointmentsView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(doctor=self.request.user).order_by("-created_at")


class AppointmentActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk, doctor=request.user)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=404)

        action = request.data.get("action")

        if action == "accepted":
            appointment.status = "accepted"
            appointment.save()

            Notification.objects.create(
                patient_email=appointment.patient_email,
                title="Appointment Accepted",
                message=(
                    f"Dr. {request.user.first_name} {request.user.last_name} "
                    f"has accepted your appointment.\n"
                    f"I will be at {request.user.clinic_address}"
                ),
                latitude=request.user.latitude,
                longitude=request.user.longitude,
                clinic_address=request.user.clinic_address
            )

            return Response({"status": "accepted"})

        elif action == "referral":
            referred_doctor_id = request.data.get("referred_doctor_id")

            if not referred_doctor_id:
                return Response({"error": "referred_doctor_id is required"}, status=400)

            try:
                referred_doctor = Doctor.objects.get(id=referred_doctor_id)
            except Doctor.DoesNotExist:
                return Response({"error": "Referred doctor not found"}, status=404)

            # Mark original as referred
            appointment.status = "referred"
            appointment.save()

            # Clone appointment for new doctor
            new_appt = Appointment.objects.create(
                doctor=referred_doctor,
                patient_name=appointment.patient_name,
                patient_email=appointment.patient_email,
                mild_illness=appointment.mild_illness,
                symptoms=appointment.symptoms,
                appointment_date=appointment.appointment_date,
                appointment_time=appointment.appointment_time,
                status="pending"
            )

            # Notify patient
            Notification.objects.create(
                patient_email=appointment.patient_email,
                title="Appointment Referred",
                message=(
                    f"Dr. {request.user.first_name} {request.user.last_name} "
                    f"has referred your appointment to "
                    f"Dr. {referred_doctor.first_name} {referred_doctor.last_name}. "
                    f"Please wait for confirmation."
                ),
            )

            return Response({
                "status": "referred",
                "new_appointment_id": new_appt.id
            })

        return Response({"error": "Invalid action"}, status=400)

class PatientRegisterView(generics.CreateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientRegisterSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print("🔥 PATIENT REGISTER ERROR:", str(e))
            raise

def get_tokens_for_patient(patient):
    refresh = RefreshToken.for_user(patient)
    refresh["type"] = "patient"
    refresh["patient_id"] = patient.id
    refresh["email"] = patient.email

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

class PatientLoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PatientLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            patient = Patient.objects.get(email=email, password=password)
        except Patient.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=400)

        tokens = get_tokens_for_patient(patient)

        return Response({
            "message": "Login successful",
            "access": tokens["access"],
            "refresh": tokens["refresh"],
            "full_name": f"{patient.first_name or ''} {patient.last_name or ''}".strip(),
            "email": patient.email
        })

class DoctorLoginView(TokenObtainPairView):
    serializer_class = DoctorTokenObtainPairSerializer

class SameSpecialtyDoctorsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        specialty = request.user.specialty
        doctors = Doctor.objects.filter(specialty=specialty).exclude(id=request.user.id)

        data = [
            {
                "id": d.id,
                "name": f"{d.first_name} {d.last_name}",
                "email": d.email
            }
            for d in doctors
        ]

        return Response(data)

class PatientNotificationsView(APIView):
    permission_classes = [IsAuthenticatedPatient]

    def get(self, request):
        patient_id = request.patient_id
        patient = Patient.objects.get(id=patient_id)

        notifs = Notification.objects.filter(patient_email=patient.email).order_by("-created_at")

        return Response([
            {
                "title": n.title,
                "message": n.message,
                "created_at": n.created_at,
                "latitude": n.latitude,
                "longitude": n.longitude,
                "clinic_address": n.clinic_address,
                "is_read": n.is_read
            } for n in notifs
        ])




