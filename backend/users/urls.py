from django.urls import path
from .views import UserListView, RoleSwitchView

urlpatterns = [
    path("", UserListView.as_view(), name="user-list"),
    path("switch-role/", RoleSwitchView.as_view(), name="switch-role"),
]
