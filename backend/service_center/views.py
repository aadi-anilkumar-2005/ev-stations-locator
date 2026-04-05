from django.shortcuts import render, redirect
from django.views.generic import TemplateView, ListView, CreateView, UpdateView, DeleteView, View
from django.urls import reverse_lazy
from django.db import transaction
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Count

from stations.models import ServiceCenter, Amenity, Address, Station, ServiceAmenity

class ServiceRoleRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.role == 'service'


# --- Dashboard ---
class ServiceCenterDashboardView(ServiceRoleRequiredMixin, TemplateView):
    template_name = 'service_center/dashboard_page.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Filter statistics by user if not admin
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            user_service_centers = ServiceCenter.objects.filter(created_by=self.request.user)
            
            context['dashboard_stats'] = {
                'total_stations': 0,  # Service users don't manage stations
                'active_stations': 0,
                'offline_stations': 0,
                'managed_locations': user_service_centers.count(),
                'active_amenities': Amenity.objects.filter(
                    serviceamenity__service__in=user_service_centers,
                    category='service'
                ).distinct().count(),
            }
        else:
            # Admin sees all data
            total_stations = Station.objects.count()
            active_stations = Station.objects.filter(status='active').count()
            offline_stations = Station.objects.filter(status='offline').count()
            
            context['dashboard_stats'] = {
                'total_stations': total_stations,
                'active_stations': active_stations,
                'offline_stations': offline_stations,
                'managed_locations': ServiceCenter.objects.count(),
                'active_amenities': Amenity.objects.filter(category='service').count(),
            }
        
        context['active_page'] = 'dashboard'
        return context


# --- Locations ---
class ServiceLocationsListView(ServiceRoleRequiredMixin, ListView):
    model = ServiceCenter
    template_name = 'service_center/locations_page.html'
    context_object_name = 'locations'

    def get_queryset(self):
        queryset = ServiceCenter.objects.select_related('address', 'created_by')
        # Filter by user if not admin
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            queryset = queryset.filter(created_by=self.request.user)
        return queryset

class ServiceLocationCreateView(ServiceRoleRequiredMixin, TemplateView):
    template_name = 'service_center/location_form_page.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'locations'
        context['amenities'] = Amenity.objects.filter(category='service')
        context['selected_amenities'] = []
        return context

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                address = Address.objects.create(
                    street=request.POST.get('address'),
                    city=request.POST.get('city'),
                    state=request.POST.get('state'),
                    zip_code=request.POST.get('zip_code'),
                    latitude=request.POST.get('latitude') or None,
                    longitude=request.POST.get('longitude') or None
                )
                sc = ServiceCenter.objects.create(
                    name=request.POST.get('name'),
                    status=request.POST.get('status'),
                    is_emergency_service=request.POST.get('is_emergency_service') == 'on',
                    opening_hours=request.POST.get('opening_hours'),
                    phone=request.POST.get('phone'),
                    email=request.POST.get('email'),
                    website=request.POST.get('website'),
                    address=address,
                    created_by=request.user
                )
                # Save selected amenities
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        ServiceAmenity.objects.get_or_create(service=sc, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue
            return redirect('service-locations-list')
        except Exception as e:
            context = self.get_context_data()
            context['error'] = str(e)
            return self.render_to_response(context)

class ServiceLocationUpdateView(ServiceRoleRequiredMixin, UpdateView):
    model = ServiceCenter
    template_name = 'service_center/location_form_page.html'
    fields = ['name']
    pk_url_kwarg = 'pk'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'locations'
        return context
    
    def get_object(self, queryset=None):
        queryset = ServiceCenter.objects.select_related('address', 'created_by')
        # Filter by user if not admin
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            queryset = queryset.filter(created_by=self.request.user)
        return queryset.get(service_id=self.kwargs['pk'])

    def post(self, request, *args, **kwargs):
        sc = self.get_object()
        try:
            with transaction.atomic():
                sc.name = request.POST.get('name')
                sc.status = request.POST.get('status')
                sc.is_emergency_service = request.POST.get('is_emergency_service') == 'on'
                sc.opening_hours = request.POST.get('opening_hours')
                sc.phone = request.POST.get('phone')
                sc.email = request.POST.get('email')
                sc.website = request.POST.get('website')

                if sc.address:
                    sc.address.street = request.POST.get('address')
                    sc.address.city = request.POST.get('city')
                    sc.address.state = request.POST.get('state')
                    sc.address.zip_code = request.POST.get('zip_code')
                    sc.address.latitude = request.POST.get('latitude') or None
                    sc.address.longitude = request.POST.get('longitude') or None
                    sc.address.save()
                sc.save()

                # Update amenities: clear old, save newly selected
                ServiceAmenity.objects.filter(service=sc).delete()
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        ServiceAmenity.objects.create(service=sc, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue
            return redirect('service-locations-list')
        except Exception as e:
            context = self.get_context_data()
            context['error'] = str(e)
            return self.render_to_response(context)

class ServiceLocationDeleteView(ServiceRoleRequiredMixin, View):
    def post(self, request, pk):
        # Check if user has permission to delete this service center
        if not request.user.is_staff and request.user.role != 'admin':
            service_center = ServiceCenter.objects.filter(service_id=pk, created_by=request.user).first()
            if not service_center:
                return redirect('service-locations-list')  # Or show error
        ServiceCenter.objects.filter(service_id=pk).delete()
        return redirect('service-locations-list')



# --- Amenities ---
class ServiceAmenitiesListView(ServiceRoleRequiredMixin, ListView):
    model = Amenity
    template_name = 'service_center/amenities_page.html'
    context_object_name = 'amenities'

    def get_queryset(self):
        queryset = Amenity.objects.filter(category='service')
        # Filter by user if not admin - only show amenities used in user's service centers
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            user_service_centers = ServiceCenter.objects.filter(created_by=self.request.user)
            queryset = queryset.filter(serviceamenity__service__in=user_service_centers).distinct()
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'amenities'
        return context

class ServiceAmenityCreateView(ServiceRoleRequiredMixin, TemplateView):
    template_name = 'service_center/amenity_form_page.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'amenities'
        context['is_edit'] = False
        return context

    def post(self, request, *args, **kwargs):
        name = request.POST.get('name', '').strip()
        if not name:
            context = self.get_context_data()
            context['error'] = 'Amenity name is required.'
            return self.render_to_response(context)
        Amenity.objects.create(name=name, category='service')
        return redirect('service-amenities-list')

class ServiceAmenityUpdateView(ServiceRoleRequiredMixin, UpdateView):
    model = Amenity
    template_name = 'service_center/amenity_form_page.html'
    fields = ['name']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'amenities'
        context['is_edit'] = True
        context['amenity'] = self.get_object()
        return context

    def post(self, request, *args, **kwargs):
        name = request.POST.get('name', '').strip()
        if not name:
            context = self.get_context_data()
            context['error'] = 'Amenity name is required.'
            return self.render_to_response(context)
        am = self.get_object()
        am.name = name
        am.category = 'service'
        am.save()
        return redirect('service-amenities-list')

class ServiceAmenityDeleteView(ServiceRoleRequiredMixin, View):
    def post(self, request, pk):
        Amenity.objects.filter(id=pk).delete()
        return redirect('service-amenities-list')
