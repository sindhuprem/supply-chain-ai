from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import UserProfile, UserRole
from .serializers import UserProfileSerializer

class UserListView(APIView):
    def get(self, request):
        users = UserProfile.objects.all()
        if not users.exists():
            # Seed default users for all 4 roles if none exist
            defaults = [
                {"username": "mfg_alpha", "role": UserRole.MANUFACTURER, "organization_name": "Apex Electronics Ltd"},
                {"username": "dist_beta", "role": UserRole.DISTRIBUTOR, "organization_name": "Metro Logistics Hub"},
                {"username": "trans_gamma", "role": UserRole.TRANSPORTER, "organization_name": "Express Freight Fleet"},
                {"username": "ret_delta", "role": UserRole.RETAILER, "organization_name": "CityMart Superstores"},
            ]
            for data in defaults:
                UserProfile.objects.create(**data)
            users = UserProfile.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)

class RoleSwitchView(APIView):
    def post(self, request):
        role = request.data.get("role")
        user = UserProfile.objects.filter(role=role).first()
        if not user:
            user = UserProfile.objects.create(
                username=f"{role.lower()}_user",
                role=role,
                organization_name=f"{role.title()} Partner Org"
            )
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
