from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.authentication import JWTAuthentication


class IsAuthenticatedPatient(BasePermission):
    def has_permission(self, request, view):
        auth = JWTAuthentication()
        try:
            validated = auth.authenticate(request)
            if not validated:
                return False

            user, token = validated

            if token.get("type") != "patient":
                return False

            request.patient_id = token.get("patient_id")
            return True

        except Exception as e:
            print("PATIENT AUTH ERROR:", e)
            return False

