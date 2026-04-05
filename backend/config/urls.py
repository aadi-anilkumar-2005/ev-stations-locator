from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('admin_panel.urls')),
    path('service-center/', include('service_center.urls')),
    path('showroom/', include('showroom.urls')),
    path('charging-station/', include('charging_station.urls')),
    path('api/auth/', include('users.urls')),
    path('api/', include('stations.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
