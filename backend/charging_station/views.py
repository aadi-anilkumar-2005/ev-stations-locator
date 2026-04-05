from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import TemplateView, ListView, View
from django.contrib.auth.mixins import UserPassesTestMixin
from django.db import transaction

from stations.models import Station, Address, Amenity, StationAmenity, ChargerType, StationCharger, Booking
from django.db.models import Count

class AdminRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        user = self.request.user
        return user.is_authenticated and (user.is_staff or getattr(user, 'role', None) in ['admin', 'station'])

# --- Dashboard ---
class CSDashboardView(AdminRequiredMixin, TemplateView):
    template_name = 'charging_station/dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'dashboard'
        
        # Filter statistics by user if not admin
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            user_stations = Station.objects.filter(created_by=self.request.user)
            context['total_stations'] = user_stations.count()
            
            # Get charger types used in user's stations
            user_charger_types = ChargerType.objects.filter(
                station_links__station__in=user_stations
            ).distinct()
            context['total_charger_types'] = user_charger_types.count()
            
            # Get amenities used in user's stations
            user_amenities = Amenity.objects.filter(
                stationamenity__station__in=user_stations,
                category='station'
            ).distinct()
            context['total_amenities'] = user_amenities.count()
            
            # Get bookings for user's stations
            Booking.sync_statuses()
            context['total_bookings'] = Booking.objects.filter(
                station__in=user_stations,
                status__in=['confirmed', 'completed']
            ).count()
        else:
            # Admin sees all data
            context['total_stations'] = Station.objects.count()
            context['total_charger_types'] = ChargerType.objects.count()
            Booking.sync_statuses()
            context['total_amenities'] = Amenity.objects.filter(category='station').count()
            context['total_bookings'] = Booking.objects.filter(status__in=['confirmed', 'completed']).count()
        
        return context

# --- Stations ---
class CSStationListView(AdminRequiredMixin, ListView):
    model = Station
    template_name = 'charging_station/stations_list.html'
    context_object_name = 'stations'

    def get_queryset(self):
        queryset = Station.objects.select_related('address', 'created_by').prefetch_related('station_chargers').order_by('-created_at')
        # Filter by user if not admin
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            queryset = queryset.filter(created_by=self.request.user)
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'stations'
        return context

class CSStationCreateView(AdminRequiredMixin, TemplateView):
    template_name = 'charging_station/station_form.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'stations'
        context['is_edit'] = False
        context['amenities'] = Amenity.objects.filter(category='station')
        context['charger_types'] = ChargerType.objects.all()
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

                station = Station.objects.create(
                    name=request.POST.get('name'),
                    operator_name=request.POST.get('operator_name'),
                    status=request.POST.get('status', 'active').lower(),
                    opening_hours=request.POST.get('opening_hours'),
                    address=address,
                    created_by=request.user
                )

                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        StationAmenity.objects.create(station=station, amenity=amenity)
                    except Amenity.DoesNotExist:
                        pass

                charger_types = request.POST.getlist('charger_types[]')
                start_prices = request.POST.getlist('start_prices[]')
                end_prices = request.POST.getlist('end_prices[]')
                
                for i, ct_id in enumerate(charger_types):
                    if not ct_id: continue
                    try:
                        c_type = ChargerType.objects.get(id=ct_id)
                        s_price = start_prices[i] if i < len(start_prices) and start_prices[i] else 0
                        e_price = end_prices[i] if i < len(end_prices) and end_prices[i] else 0
                        StationCharger.objects.create(station=station, charger_type=c_type, start_price=s_price, end_price=e_price)
                    except ChargerType.DoesNotExist:
                        pass
            return redirect('admin-cs-stations')
        except Exception as e:
            context = self.get_context_data()
            context['error'] = str(e)
            return self.render_to_response(context)

class CSStationUpdateView(AdminRequiredMixin, TemplateView):
    template_name = 'charging_station/station_form.html'
    
    def get_station(self):
        return Station.objects.select_related('address').prefetch_related('station_chargers', 'station_amenities').get(station_id=self.kwargs['pk'])
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        station = self.get_station()
        context['active_page'] = 'stations'
        context['is_edit'] = True
        context['station'] = station
        context['amenities'] = Amenity.objects.filter(category='station')
        context['charger_types'] = ChargerType.objects.all()
        context['selected_amenities'] = list(station.station_amenities.values_list('amenity_id', flat=True))
        return context
        
    def post(self, request, *args, **kwargs):
        station = self.get_station()
        try:
            with transaction.atomic():
                address = station.address
                if address:
                    address.street = request.POST.get('address')
                    address.city = request.POST.get('city')
                    address.state = request.POST.get('state')
                    address.zip_code = request.POST.get('zip_code')
                    address.latitude = request.POST.get('latitude') or None
                    address.longitude = request.POST.get('longitude') or None
                    address.save()

                station.name = request.POST.get('name')
                station.operator_name = request.POST.get('operator_name')
                station.status = request.POST.get('status', 'active').lower()
                station.opening_hours = request.POST.get('opening_hours')
                station.save()

                StationAmenity.objects.filter(station=station).delete()
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        StationAmenity.objects.create(station=station, amenity=amenity)
                    except Amenity.DoesNotExist:
                        pass

                StationCharger.objects.filter(station=station).delete()
                charger_types = request.POST.getlist('charger_types[]')
                start_prices = request.POST.getlist('start_prices[]')
                end_prices = request.POST.getlist('end_prices[]')
                
                for i, ct_id in enumerate(charger_types):
                    if not ct_id: continue
                    try:
                        c_type = ChargerType.objects.get(id=ct_id)
                        s_price = start_prices[i] if i < len(start_prices) and start_prices[i] else 0
                        e_price = end_prices[i] if i < len(end_prices) and end_prices[i] else 0
                        StationCharger.objects.create(station=station, charger_type=c_type, start_price=s_price, end_price=e_price)
                    except ChargerType.DoesNotExist:
                        pass
            return redirect('admin-cs-stations')
        except Exception as e:
            context = self.get_context_data()
            context['error'] = str(e)
            return self.render_to_response(context)

class CSStationDeleteView(AdminRequiredMixin, View):
    def post(self, request, pk):
        # Check if user has permission to delete this station
        if not request.user.is_staff and request.user.role != 'admin':
            station = Station.objects.filter(station_id=pk, created_by=request.user).first()
            if not station:
                return redirect('admin-cs-stations')  # Or show error
        Station.objects.filter(station_id=pk).delete()
        return redirect('admin-cs-stations')


# --- Charger Types ---
class CSChargerTypeListView(AdminRequiredMixin, ListView):
    model = ChargerType
    template_name = 'charging_station/charger_types_list.html'
    context_object_name = 'charger_types'
    
    def get_queryset(self):
        queryset = ChargerType.objects.all().order_by('name')
        # Filter by user if not admin - only show charger types used in user's stations
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            user_stations = Station.objects.filter(created_by=self.request.user)
            queryset = queryset.filter(station_links__station__in=user_stations).distinct()
        return queryset
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'charger_types'
        return context

class CSChargerTypeCreateView(AdminRequiredMixin, TemplateView):
    template_name = 'charging_station/charger_type_form.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'charger_types'
        return context
        
    def post(self, request, *args, **kwargs):
        name = request.POST.get('name')
        connector = request.POST.get('connector_type')
        power = request.POST.get('max_power_kw')
        ChargerType.objects.create(name=name, connector_type=connector, max_power_kw=power)
        return redirect('admin-cs-chargers')

class CSChargerTypeUpdateView(AdminRequiredMixin, TemplateView):
    template_name = 'charging_station/charger_type_form.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'charger_types'
        context['charger'] = ChargerType.objects.get(id=self.kwargs['pk'])
        return context
        
    def post(self, request, pk):
        ct = ChargerType.objects.get(id=pk)
        ct.name = request.POST.get('name')
        ct.connector_type = request.POST.get('connector_type')
        ct.max_power_kw = request.POST.get('max_power_kw')
        ct.save()
        return redirect('admin-cs-chargers')

class CSChargerTypeDeleteView(AdminRequiredMixin, View):
    def post(self, request, pk):
        ChargerType.objects.filter(id=pk).delete()
        return redirect('admin-cs-chargers')


# --- Amenities ---
class CSAmenityListView(AdminRequiredMixin, ListView):
    model = Amenity
    template_name = 'charging_station/amenities_list.html'
    context_object_name = 'amenities'
    
    def get_queryset(self):
        queryset = Amenity.objects.filter(category='station').order_by('name')
        # Filter by user if not admin - only show amenities used in user's stations
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            user_stations = Station.objects.filter(created_by=self.request.user)
            queryset = queryset.filter(stationamenity__station__in=user_stations).distinct()
        return queryset
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'amenities'
        return context

class CSAmenityCreateView(AdminRequiredMixin, TemplateView):
    template_name = 'charging_station/amenity_form.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'amenities'
        return context
        
    def post(self, request, *args, **kwargs):
        name = request.POST.get('name')
        if name:
            Amenity.objects.create(name=name, category='station')
        return redirect('admin-cs-amenities')

class CSAmenityUpdateView(AdminRequiredMixin, TemplateView):
    template_name = 'charging_station/amenity_form.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'amenities'
        context['amenity'] = Amenity.objects.get(id=self.kwargs['pk'])
        return context
        
    def post(self, request, pk):
        amenity = Amenity.objects.get(id=pk)
        amenity.name = request.POST.get('name')
        amenity.save()
        return redirect('admin-cs-amenities')

class CSAmenityDeleteView(AdminRequiredMixin, View):
    def post(self, request, pk):
        Amenity.objects.filter(id=pk).delete()
        return redirect('admin-cs-amenities')

# --- Bookings ---
class CSBookingListView(AdminRequiredMixin, ListView):
    model = Booking
    template_name = 'charging_station/bookings_list.html'
    context_object_name = 'bookings'
    
    def get_queryset(self):
        Booking.sync_statuses()
        queryset = Booking.objects.select_related('user', 'station', 'station_charger__charger_type').order_by('-created_at')
        # Filter by user if not admin
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            # Station users can only see bookings for their stations
            user_stations = Station.objects.filter(created_by=self.request.user)
            queryset = queryset.filter(station__in=user_stations)
        return queryset
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'bookings'
        return context
