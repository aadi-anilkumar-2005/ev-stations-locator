from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls), # standard admin? Actually it seems there was no default admin in the last state.
    path('', include('admin_panel.urls')),
    path('service-center/', include('service_center.urls')),
    path('api/auth/', include('users.urls')),
    path('api/', include('stations.urls')),
]
