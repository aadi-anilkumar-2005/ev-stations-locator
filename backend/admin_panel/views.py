from django.views.generic import TemplateView

class AdminLoginView(TemplateView):
    template_name = 'admin/login.html'

class AdminDashboardView(TemplateView):
    template_name = 'admin/dashboard.html'

class AdminStationsView(TemplateView):
    template_name = 'admin/stations.html'

class AdminAddStationView(TemplateView):
    template_name = 'admin/add-station.html'

class AdminShowroomsView(TemplateView):
    template_name = 'admin/showrooms.html'

class AdminAddShowroomView(TemplateView):
    template_name = 'admin/add-showroom.html'

class AdminServiceCentersView(TemplateView):
    template_name = 'admin/service-centers.html'

class AdminAddServiceCenterView(TemplateView):
    template_name = 'admin/add-service-center.html'

class AdminUsersView(TemplateView):
    template_name = 'admin/users.html'

class AdminAnalyticsView(TemplateView):
    template_name = 'admin/analytics.html'

class AdminSettingsView(TemplateView):
    template_name = 'admin/settings.html'
