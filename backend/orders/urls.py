from django.urls import path
from .views import OrderListView, TransporterListView

urlpatterns = [
    path("", OrderListView.as_view(), name="order-list"),
    path("transporters/", TransporterListView.as_view(), name="transporter-list"),
]
