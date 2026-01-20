from django.urls import path
from .views import (
    DoctorRegisterView,
    DoctorListView,
    DoctorStatsView,
    DoctorProfileView,
    CreateAppointmentView,
    DoctorAppointmentsView,
    AppointmentActionView,
    SameSpecialtyDoctorsView,
    PatientRegisterView,
    PatientLoginView,
    DoctorLoginView,
    PatientNotificationsView
)
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    # Doctor routes
    path('', DoctorListView.as_view(), name='doctor-list'),
    path("doctors/register/", DoctorRegisterView.as_view(), name='doctor-register'),
    path("doctors/login/", DoctorLoginView.as_view(), name='doctor-login'),
    path("doctor-stats/", DoctorStatsView.as_view(), name="doctor-stats"),
    path("doctor-profile/", DoctorProfileView.as_view(), name="doctor-profile"),
    path("appointments/create/", CreateAppointmentView.as_view()),
    path("appointments/doctor/", DoctorAppointmentsView.as_view()),
    path("appointments/action/<int:pk>/", AppointmentActionView.as_view()),

    # Patient routes
    path("patients/register/", PatientRegisterView.as_view()),
    path("patients/login/", PatientLoginView.as_view()),
    path("notifications/", PatientNotificationsView.as_view()),
    path("doctors/same-specialty/", SameSpecialtyDoctorsView.as_view()),
    

]
