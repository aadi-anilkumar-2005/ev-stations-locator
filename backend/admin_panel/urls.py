from django.urls import path
from .views import (
    AdminLoginView, AdminDashboardView, AdminStationsView, AdminAddStationView,
    AdminShowroomsView, AdminAddShowroomView, AdminServiceCentersView,
    AdminAddServiceCenterView, AdminUsersView, AdminAnalyticsView, AdminSettingsView
)

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('stations/', AdminStationsView.as_view(), name='admin-stations'),
    path('stations/add/', AdminAddStationView.as_view(), name='admin-add-station'),
    path('showrooms/', AdminShowroomsView.as_view(), name='admin-showrooms'),
    path('showrooms/add/', AdminAddShowroomView.as_view(), name='admin-add-showroom'),
    path('service-centers/', AdminServiceCentersView.as_view(), name='admin-service-centers'),
    path('service-centers/add/', AdminAddServiceCenterView.as_view(), name='admin-add-service-center'),
    path('users/', AdminUsersView.as_view(), name='admin-users'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
]
