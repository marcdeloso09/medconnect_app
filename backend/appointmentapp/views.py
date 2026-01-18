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
from .models import Patient
from .serializers import PatientRegisterSerializer, PatientLoginSerializer


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
            "profile_picture": doctor.profile_picture.build_url(secure=True) if doctor.profile_picture else None,
        })

    def put(self, request):
        doctor = request.user

        try:
            doctor.first_name = request.data.get("first_name", doctor.first_name)
            doctor.last_name = request.data.get("last_name", doctor.last_name)
            doctor.email = request.data.get("email", doctor.email)
            doctor.mild_illness = request.data.get("mild_illness", doctor.mild_illness)
            doctor.symptoms = request.data.get("symptoms", doctor.symptoms)

            if request.data.get("availability_date"):
                doctor.availability_date = request.data.get("availability_date")

            if request.data.get("availability_time"):
                doctor.availability_time = request.data.get("availability_time")

            if 'profile_picture' in request.FILES:
                doctor.profile_picture = request.FILES['profile_picture']

            doctor.save()

            return Response({
                "message": "Profile updated successfully",
                "profile_picture": doctor.profile_picture.build_url() if doctor.profile_picture else None
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
            message = f"""
                        Hello {appointment.patient_name},

                        Your appointment has been ACCEPTED.

                        This is Dr. {request.user.first_name} {request.user.last_name}

                        Please reply to confirm your visit.

                        - HealthConnect
                        """
        else:
            appointment.status = "rejected"
            message = f"""
            Hello {appointment.patient_name},

            Unfortunately, your appointment has been REJECTED.

            Doctor: Dr. {request.user.first_name} {request.user.last_name}

            - HealthConnect
            """

        appointment.save()

        send_mail(
            subject="Appointment Status Update",
            message=message,
            from_email=None,  # uses DEFAULT_FROM_EMAIL
            recipient_list=[appointment.patient_email],
            fail_silently=False
        )

        return Response({"status": appointment.status})
    
class PatientRegisterView(generics.CreateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientRegisterSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print("🔥 PATIENT REGISTER ERROR:", str(e))
            raise

class PatientLoginView(APIView):
    def post(self, request):
        serializer = PatientLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            patient = Patient.objects.get(email=email, password=password)
        except Patient.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=400)

        return Response({
            "message": "Login successful",
            "first_name": patient.first_name,
            "email": patient.email
        })
