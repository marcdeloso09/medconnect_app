from django.urls import path
from .views import DoctorRegisterView, DoctorListView, DoctorStatsView, DoctorProfileView, CreateAppointmentView, DoctorAppointmentsView, AppointmentActionView
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import PatientRegisterView, PatientLoginView


urlpatterns = [
    path('', DoctorListView.as_view(), name='doctor-list'),    
    path('register/', DoctorRegisterView.as_view(), name='doctor-register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("doctor-stats/", DoctorStatsView.as_view(), name="doctor-stats"),
    path("doctor-profile/", DoctorProfileView.as_view(), name="doctor-profile"),
    path("appointments/create/", CreateAppointmentView.as_view()),
    path("appointments/doctor/", DoctorAppointmentsView.as_view()),
    path("appointments/action/<int:pk>/", AppointmentActionView.as_view()),
    path("/api/patients/register/", PatientRegisterView.as_view()),
    path("patients/login/", PatientLoginView.as_view()),

]
