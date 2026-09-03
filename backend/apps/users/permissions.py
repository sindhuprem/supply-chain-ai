from rest_framework import permissions
from .models import User

class IsManufacturer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.ROLE_MANUFACTURER)

class IsDistributor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.ROLE_DISTRIBUTOR)

class IsTransporter(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.ROLE_TRANSPORTER)

class IsRetailer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.ROLE_RETAILER)

class IsManufacturerOrDistributor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            request.user.role in [User.ROLE_MANUFACTURER, User.ROLE_DISTRIBUTOR]
        )
