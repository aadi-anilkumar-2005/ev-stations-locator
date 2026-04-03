from django.views.generic import TemplateView, FormView, RedirectView, DetailView, UpdateView, DeleteView, ListView, CreateView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.shortcuts import redirect, render, get_object_or_404
from django.db import transaction
from django.core.paginator import Paginator
from stations.models import Station, Address, Amenity, StationAmenity, ChargerType, StationCharger, Showroom


class AdminRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_staff


class AdminLoginView(LoginView):
    template_name = 'admin/auth/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse_lazy('admin-dashboard')

    def form_invalid(self, form):
        return self.render_to_response(self.get_context_data(form=form, error="Invalid email or password"))


class AdminLogoutView(LogoutView):
    next_page = reverse_lazy('admin-login')
    http_method_names = ['get', 'post', 'options']

    def _do_logout(self, request):
        from django.contrib.auth import logout as django_logout

        # Clear session data before logout to ensure no residue remains
        try:
            request.session.flush()
        except Exception:
            pass

        django_logout(request)
        return redirect(self.next_page)

    def get(self, request, *args, **kwargs):
        return self._do_logout(request)

    def post(self, request, *args, **kwargs):
        return self._do_logout(request)


class AdminDashboardView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/dashboard/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from stations.models import Station, Showroom, ServiceCenter
        from django.contrib.auth import get_user_model
        from django.db.models import Count, Q

        User = get_user_model()

        # 1. Totals
        total_stations = Station.objects.count()
        total_users = User.objects.count()
        total_showrooms = Showroom.objects.count()
        total_service = ServiceCenter.objects.count()

        context['stats'] = {
            'total_stations': total_stations,
            'total_users': total_users,
            'total_locations': total_showrooms + total_service,
            'active_stations': Station.objects.filter(status='active').count()
        }

        # 2. Status Chart Data (Active vs Maintenance vs Offline)
        # Getting counts for each status
        status_counts = Station.objects.values(
            'status').annotate(count=Count('status'))
        # Format for template: [{'status': 'active', 'count': 10, 'percentage': 50}, ...]
        formatted_status = []
        for item in status_counts:
            count = item['count']
            percentage = (count / total_stations *
                          100) if total_stations > 0 else 0
            formatted_status.append({
                'status': item['status'],
                'count': count,
                'percentage': round(percentage, 1),
                'color': self._get_status_color(item['status'])
            })
        context['station_status'] = formatted_status

        # 3. Recent Activity (Users and Stations)
        # Fetch last 5 users and last 5 stations, combine and sort
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_stations = Station.objects.order_by('-created_at')[:5]

        activity = []
        for user in recent_users:
            activity.append({
                'type': 'New User',
                'desc': f"{user.username} joined the platform",
                'time': user.date_joined,
                'icon': 'user-plus',
                'color': 'text-primary',
                'bg': 'bg-primary-subtle'
            })

        for station in recent_stations:
            activity.append({
                'type': 'New Station',
                'desc': f"{station.name} was added",
                'time': station.created_at,
                'icon': 'zap',
                'color': 'text-emerald',
                'bg': 'bg-emerald-subtle'
            })

        # Sort combined list by time descending and take top 5
        activity.sort(key=lambda x: x['time'], reverse=True)
        context['recent_activity'] = activity[:8]

        return context

    def _get_status_color(self, status):
        if status == 'active':
            return 'bg-emerald'
        if status == 'maintenance':
            return 'bg-warning'
        return 'bg-secondary'


class AdminStationsView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/stations/stations.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        stations_list = Station.objects.select_related(
            'address').all().order_by('-created_at')
        paginator = Paginator(stations_list, 10)  # Show 10 stations per page

        page_number = self.request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context['stations'] = page_obj
        context['page_obj'] = page_obj
        return context


class AdminStationDetailView(AdminRequiredMixin, DetailView):
    model = Station
    template_name = 'admin/stations/station_detail.html'
    context_object_name = 'station'


class AdminAddStationView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/stations/add-station.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['amenities'] = Amenity.objects.filter(category='station')
        context['charger_types'] = ChargerType.objects.all()
        return context

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                # 1. Create Address
                address = Address.objects.create(
                    street=request.POST.get('address'),
                    city=request.POST.get('city'),
                    state=request.POST.get('state'),
                    zip_code=request.POST.get('zip_code'),
                    latitude=request.POST.get('latitude') or None,
                    longitude=request.POST.get('longitude') or None
                )

                # 2. Create Station
                station = Station.objects.create(
                    name=request.POST.get('name'),
                    operator_name=request.POST.get('operator_name'),
                    status=request.POST.get('status', 'active').lower(),
                    opening_hours=request.POST.get('opening_hours'),
                    address=address
                )

                # 3. Add Amenities
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        StationAmenity.objects.create(
                            station=station, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue

                # 4. Add Chargers
                charger_types = request.POST.getlist('charger_types[]')
                start_prices = request.POST.getlist('start_prices[]')
                end_prices = request.POST.getlist('end_prices[]')

                for i, ct_id in enumerate(charger_types):
                    if not ct_id:
                        continue
                    try:
                        c_type = ChargerType.objects.get(id=ct_id)

                        s_price = start_prices[i] if i < len(
                            start_prices) and start_prices[i] else 0
                        e_price = end_prices[i] if i < len(
                            end_prices) and end_prices[i] else 0

                        StationCharger.objects.create(
                            station=station,
                            charger_type=c_type,
                            start_price=s_price,
                            end_price=e_price
                        )
                    except ChargerType.DoesNotExist:
                        continue

            return redirect('admin-stations')
        except Exception as e:
            print(f"Error creating station: {e}")
            context = self.get_context_data()
            context['error'] = str(e)
            return render(request, self.template_name, context)


class AdminStationEditView(AdminRequiredMixin, UpdateView):
    model = Station
    template_name = 'admin/stations/add-station.html'
    fields = ['name', 'operator_name', 'status', 'opening_hours']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = True
        context['amenities'] = Amenity.objects.filter(category='station')
        context['charger_types'] = ChargerType.objects.all()

        # Pre-select amenities
        station = self.get_object()
        context['selected_amenities'] = list(
            station.station_amenities.values_list('amenity_id', flat=True))
        return context

    def post(self, request, *args, **kwargs):
        station = self.get_object()
        try:
            with transaction.atomic():
                # 1. Update Address
                address = station.address
                if address:
                    address.street = request.POST.get('address')
                    address.city = request.POST.get('city')
                    address.state = request.POST.get('state')
                    address.zip_code = request.POST.get('zip_code')
                    address.latitude = request.POST.get('latitude') or None
                    address.longitude = request.POST.get('longitude') or None
                    address.save()

                # 2. Update Station Fields
                station.name = request.POST.get('name')
                station.operator_name = request.POST.get('operator_name')
                station.status = request.POST.get('status', 'active').lower()
                station.opening_hours = request.POST.get('opening_hours')
                station.save()

                # 3. Update Amenities (Clear and Re-add)
                StationAmenity.objects.filter(station=station).delete()
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        StationAmenity.objects.create(
                            station=station, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue

                # 4. Update Chargers (Clear and Re-add)
                StationCharger.objects.filter(station=station).delete()
                charger_types = request.POST.getlist('charger_types[]')
                start_prices = request.POST.getlist('start_prices[]')
                end_prices = request.POST.getlist('end_prices[]')

                for i, ct_id in enumerate(charger_types):
                    if not ct_id:
                        continue
                    try:
                        c_type = ChargerType.objects.get(id=ct_id)

                        s_price = start_prices[i] if i < len(
                            start_prices) and start_prices[i] else 0
                        e_price = end_prices[i] if i < len(
                            end_prices) and end_prices[i] else 0

                        StationCharger.objects.create(
                            station=station,
                            charger_type=c_type,
                            start_price=s_price,
                            end_price=e_price
                        )
                    except ChargerType.DoesNotExist:
                        continue

            return redirect('admin-stations')
        except Exception as e:
            print(f"Error updating station: {e}")
            context = self.get_context_data()
            context['error'] = str(e)
            return render(request, self.template_name, context)


class AdminStationDeleteView(AdminRequiredMixin, DeleteView):
    model = Station
    success_url = reverse_lazy('admin-stations')

    def get(self, request, *args, **kwargs):
        return redirect(self.success_url)

# --- Amenities Management ---


class AdminAmenitiesView(AdminRequiredMixin, ListView):
    model = Amenity
    template_name = 'admin/amenities/amenities.html'
    context_object_name = 'amenities'
    paginate_by = 20
    ordering = ['category', 'name']

    def get_queryset(self):
        return Amenity.objects.all().order_by('category', 'name')


class AdminAddAmenityView(AdminRequiredMixin, CreateView):
    model = Amenity
    template_name = 'admin/amenities/add-amenity.html'
    fields = ['name', 'category']
    success_url = reverse_lazy('admin-amenities')

    def form_valid(self, form):
        # We no longer force 'station' category
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = False
        return context


class AdminEditAmenityView(AdminRequiredMixin, UpdateView):
    model = Amenity
    template_name = 'admin/amenities/add-amenity.html'
    fields = ['name', 'category']
    success_url = reverse_lazy('admin-amenities')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = True
        return context


class AdminDeleteAmenityView(AdminRequiredMixin, DeleteView):
    model = Amenity
    success_url = reverse_lazy('admin-amenities')

    def get(self, request, *args, **kwargs):
        return redirect(self.success_url)

# --- Charger Types Management ---


class AdminChargerTypesView(AdminRequiredMixin, ListView):
    model = ChargerType
    template_name = 'admin/charger_types/charger-types.html'
    context_object_name = 'charger_types'
    paginate_by = 10
    ordering = ['name']


class AdminAddChargerTypeView(AdminRequiredMixin, CreateView):
    model = ChargerType
    template_name = 'admin/charger_types/add-charger-type.html'
    fields = ['name', 'connector_type', 'max_power_kw']
    success_url = reverse_lazy('admin-charger-types')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = False
        return context


class AdminEditChargerTypeView(AdminRequiredMixin, UpdateView):
    model = ChargerType
    template_name = 'admin/charger_types/add-charger-type.html'
    fields = ['name', 'connector_type', 'max_power_kw']
    success_url = reverse_lazy('admin-charger-types')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = True
        return context


class AdminDeleteChargerTypeView(AdminRequiredMixin, DeleteView):
    model = ChargerType
    success_url = reverse_lazy('admin-charger-types')

    def get(self, request, *args, **kwargs):
        return redirect(self.success_url)

# --- Brands Management ---


class AdminBrandsView(AdminRequiredMixin, ListView):
    from stations.models import Brand
    model = Brand
    template_name = 'admin/brands/brands.html'
    context_object_name = 'brands'
    paginate_by = 20
    ordering = ['name']


class AdminAddBrandView(AdminRequiredMixin, CreateView):
    from stations.models import Brand
    model = Brand
    template_name = 'admin/brands/add-brand.html'
    fields = ['name']
    success_url = reverse_lazy('admin-brands')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = False
        return context


class AdminEditBrandView(AdminRequiredMixin, UpdateView):
    from stations.models import Brand
    model = Brand
    template_name = 'admin/brands/add-brand.html'
    fields = ['name']
    success_url = reverse_lazy('admin-brands')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = True
        return context


class AdminDeleteBrandView(AdminRequiredMixin, DeleteView):
    from stations.models import Brand
    model = Brand
    success_url = reverse_lazy('admin-brands')

    def get(self, request, *args, **kwargs):
        return redirect(self.success_url)

# --- Other Views ---


class AdminShowroomsView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/showrooms/showrooms.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Fetch showrooms with related optimized queries
        showrooms_list = Showroom.objects.select_related(
            'address', 'brand').all().order_by('-created_at')

        # Pagination
        paginator = Paginator(showrooms_list, 10)
        page_number = self.request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context['showrooms'] = page_obj
        context['page_obj'] = page_obj
        return context


class AdminAddShowroomView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/showrooms/add-showroom.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from stations.models import Brand
        context['brands'] = Brand.objects.all()
        context['amenities'] = Amenity.objects.filter(category='showroom')
        return context

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                from stations.models import Brand, Showroom, ShowroomAmenity

                # 1. Create Address
                address = Address.objects.create(
                    street=request.POST.get('address'),
                    city=request.POST.get('city'),
                    state=request.POST.get('state'),
                    zip_code=request.POST.get('zip_code'),
                    latitude=request.POST.get('latitude') or None,
                    longitude=request.POST.get('longitude') or None
                )

                # 2. Get Brand
                brand_id = request.POST.get('brand_id')
                brand = Brand.objects.get(pk=brand_id) if brand_id else None

                # 3. Create Showroom
                showroom = Showroom.objects.create(
                    name=request.POST.get('name'),
                    brand=brand,
                    status=request.POST.get('status', 'active'),
                    opening_hours=request.POST.get('opening_hours'),
                    phone=request.POST.get('phone'),
                    email=request.POST.get('email'),
                    website=request.POST.get('website'),
                    address=address
                )

                # 4. Add Amenities
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        ShowroomAmenity.objects.create(
                            showroom=showroom, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue

            return redirect('admin-showrooms')
        except Exception as e:
            print(f"Error creating showroom: {e}")
            context = self.get_context_data()
            context['error'] = str(e)
            return render(request, self.template_name, context)


class AdminShowroomDetailView(AdminRequiredMixin, DetailView):
    model = Showroom
    template_name = 'admin/showrooms/showroom_detail.html'
    context_object_name = 'showroom'


class AdminShowroomEditView(AdminRequiredMixin, UpdateView):
    model = Showroom
    template_name = 'admin/showrooms/add-showroom.html'
    fields = ['name', 'status', 'opening_hours', 'phone',
              'email', 'website']  # address and brand handled manually

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = True
        from stations.models import Brand
        context['brands'] = Brand.objects.all()
        context['amenities'] = Amenity.objects.filter(category='showroom')

        showroom = self.get_object()
        context['selected_amenities'] = list(
            showroom.showroom_amenities.values_list('amenity_id', flat=True))
        return context

    def post(self, request, *args, **kwargs):
        showroom = self.get_object()
        try:
            with transaction.atomic():
                from stations.models import Brand, ShowroomAmenity

                # 1. Update Address
                address = showroom.address
                if address:
                    address.street = request.POST.get('address')
                    address.city = request.POST.get('city')
                    address.state = request.POST.get('state')
                    address.zip_code = request.POST.get('zip_code')
                    address.latitude = request.POST.get('latitude') or None
                    address.longitude = request.POST.get('longitude') or None
                    address.save()

                # 2. Update Showroom Fields
                showroom.name = request.POST.get('name')

                brand_id = request.POST.get('brand_id')
                showroom.brand = Brand.objects.get(
                    pk=brand_id) if brand_id else None

                showroom.status = request.POST.get('status', 'active')
                showroom.opening_hours = request.POST.get('opening_hours')
                showroom.phone = request.POST.get('phone')
                showroom.email = request.POST.get('email')
                showroom.website = request.POST.get('website')
                showroom.save()

                # 3. Update Amenities
                ShowroomAmenity.objects.filter(showroom=showroom).delete()
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        ShowroomAmenity.objects.create(
                            showroom=showroom, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue

            return redirect('admin-showrooms')
        except Exception as e:
            print(f"Error updating showroom: {e}")
            context = self.get_context_data()
            context['error'] = str(e)
            return render(request, self.template_name, context)


class AdminShowroomDeleteView(AdminRequiredMixin, DeleteView):
    model = Showroom
    success_url = reverse_lazy('admin-showrooms')

    def get(self, request, *args, **kwargs):
        return redirect(self.success_url)


class AdminServiceCentersView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/service_centers/service-centers.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from stations.models import ServiceCenter
        service_centers = ServiceCenter.objects.select_related(
            'address').all().order_by('-created_at')

        paginator = Paginator(service_centers, 10)
        page_number = self.request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context['service_centers'] = page_obj
        context['page_obj'] = page_obj
        return context


class AdminAddServiceCenterView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/service_centers/add-service-center.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['amenities'] = Amenity.objects.filter(category='service')
        return context

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                from stations.models import ServiceCenter, ServiceAmenity

                address = Address.objects.create(
                    street=request.POST.get('address'),
                    city=request.POST.get('city'),
                    state=request.POST.get('state'),
                    zip_code=request.POST.get('zip_code'),
                    latitude=request.POST.get('latitude') or None,
                    longitude=request.POST.get('longitude') or None
                )

                service_center = ServiceCenter.objects.create(
                    name=request.POST.get('name'),
                    status=request.POST.get('status', 'active'),
                    is_emergency_service=request.POST.get(
                        'is_emergency_service') == 'on',
                    opening_hours=request.POST.get('opening_hours'),
                    phone=request.POST.get('phone'),
                    email=request.POST.get('email'),
                    website=request.POST.get('website'),
                    address=address
                )

                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        ServiceAmenity.objects.create(
                            service=service_center, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue

            return redirect('admin-service-centers')
        except Exception as e:
            print(f"Error creating service center: {e}")
            context = self.get_context_data()
            context['error'] = str(e)
            return render(request, self.template_name, context)


class AdminServiceCenterDetailView(AdminRequiredMixin, DetailView):
    from stations.models import ServiceCenter
    model = ServiceCenter
    template_name = 'admin/service_centers/service_center_detail.html'
    context_object_name = 'service_center'


class AdminServiceCenterEditView(AdminRequiredMixin, UpdateView):
    from stations.models import ServiceCenter
    model = ServiceCenter
    template_name = 'admin/service_centers/add-service-center.html'
    fields = ['name', 'status', 'opening_hours', 'phone',
              'email', 'website', 'is_emergency_service']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = True
        context['amenities'] = Amenity.objects.filter(category='service')

        service_center = self.get_object()
        context['selected_amenities'] = list(
            service_center.service_amenities.values_list('amenity_id', flat=True))
        return context

    def post(self, request, *args, **kwargs):
        service_center = self.get_object()
        try:
            with transaction.atomic():
                from stations.models import ServiceAmenity

                # Update Address
                address = service_center.address
                if address:
                    address.street = request.POST.get('address')
                    address.city = request.POST.get('city')
                    address.state = request.POST.get('state')
                    address.zip_code = request.POST.get('zip_code')
                    address.latitude = request.POST.get('latitude') or None
                    address.longitude = request.POST.get('longitude') or None
                    address.save()

                # Update Service Center Fields
                service_center.name = request.POST.get('name')
                service_center.status = request.POST.get('status', 'active')
                service_center.is_emergency_service = request.POST.get(
                    'is_emergency_service') == 'on'
                service_center.opening_hours = request.POST.get(
                    'opening_hours')
                service_center.phone = request.POST.get('phone')
                service_center.email = request.POST.get('email')
                service_center.website = request.POST.get('website')
                service_center.save()

                # Update Amenities
                ServiceAmenity.objects.filter(service=service_center).delete()
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        ServiceAmenity.objects.create(
                            service=service_center, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue

            return redirect('admin-service-centers')
        except Exception as e:
            print(f"Error updating service center: {e}")
            context = self.get_context_data()
            context['error'] = str(e)
            return render(request, self.template_name, context)


class AdminServiceCenterDeleteView(AdminRequiredMixin, DeleteView):
    from stations.models import ServiceCenter
    model = ServiceCenter
    success_url = reverse_lazy('admin-service-centers')

    def get(self, request, *args, **kwargs):
        return redirect(self.success_url)


class AdminUsersView(AdminRequiredMixin, ListView):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    model = User
    template_name = 'admin/users/users.html'
    context_object_name = 'users'
    paginate_by = 10
    ordering = ['-date_joined']

    def get_queryset(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        queryset = User.objects.select_related(
            'profile').all().order_by('-date_joined')

        # Search
        search_query = self.request.GET.get('search', '')
        if search_query:
            queryset = queryset.filter(
                username__icontains=search_query
            ) | queryset.filter(
                email__icontains=search_query
            ) | queryset.filter(
                full_name__icontains=search_query
            )

        # Filter by Status
        status_filter = self.request.GET.get('status', 'all')
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from django.contrib.auth import get_user_model
        User = get_user_model()

        # Stats
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = total_users - active_users

        context['stats'] = {
            'total': total_users,
            'active': active_users,
            'inactive': inactive_users,
            # Placeholder logic for "New"
            'new_this_month': User.objects.filter(date_joined__month=7).count()
        }
        return context


class AdminAddUserView(AdminRequiredMixin, CreateView):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    model = User
    template_name = 'admin/users/add-user.html'
    fields = ['full_name', 'email', 'is_active', 'is_staff']
    success_url = reverse_lazy('admin-users')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = False
        return context

    def form_valid(self, form):
        user = form.save(commit=False)
        # Auto-generate username from email if not present (since we removed the field)
        # AbstractUser requires username
        if not user.username:
            import uuid
            # Strategy: Use email prefix + random string to ensure uniqueness
            base_username = user.email.split('@')[0]
            user.username = f"{base_username}_{uuid.uuid4().hex[:8]}"

        password = self.request.POST.get('password')
        if password:
            user.set_password(password)
        else:
            # Set unuable password if missing.
            pass
        user.save()

        # Save/Update UserProfile with phone number
        phone_number = self.request.POST.get('phone_number')
        if phone_number:
            from users.models import UserProfile
            UserProfile.objects.update_or_create(
                user=user, defaults={'phone_number': phone_number})

        return redirect(self.success_url)


class AdminEditUserView(AdminRequiredMixin, UpdateView):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    model = User
    template_name = 'admin/users/add-user.html'
    fields = ['full_name', 'email', 'is_active', 'is_staff']
    success_url = reverse_lazy('admin-users')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = True

        # Pre-fill phone number from profile
        user = self.get_object()
        if hasattr(user, 'profile'):
            context['phone_number'] = user.profile.phone_number

        return context

    def form_valid(self, form):
        user = form.save(commit=False)
        password = self.request.POST.get('password')
        if password:
            user.set_password(password)
        user.save()

        # Update UserProfile
        phone_number = self.request.POST.get('phone_number')
        from users.models import UserProfile
        # use update_or_create to handle cases where profile might be missing
        UserProfile.objects.update_or_create(
            user=user,
            defaults={'phone_number': phone_number}
        )

        return redirect(self.success_url)


class AdminDeleteUserView(AdminRequiredMixin, DeleteView):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    model = User
    success_url = reverse_lazy('admin-users')

    # Removed GET override to enforce standard POST-only deletion
    # If accessed via GET, it will return 405 (Method Not Allowed) or show confirm template if configured,
    # but our frontend now handles confirmation and sends POST.


class AdminSettingsView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/settings/settings.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user

        # Ensure related objects exist (lazy creation)
        from users.models import UserProfile, UserPreferences, UserNotificationSettings

        UserProfile.objects.get_or_create(user=user)
        UserPreferences.objects.get_or_create(user=user)
        UserNotificationSettings.objects.get_or_create(user=user)

        context['user'] = user
        # Access related objects directly in template via user.profile, user.preferences, etc.
        # But we can pass them explicitly if needed or confirming they exist triggers the refresh

        return context

    def post(self, request, *args, **kwargs):
        user = request.user
        from django.contrib import messages
        from django.contrib.auth import update_session_auth_hash
        from users.models import UserProfile, UserPreferences, UserNotificationSettings

        action = request.POST.get('action')

        try:
            if action == 'update_profile':
                user.full_name = request.POST.get('full_name', '')
                user.email = request.POST.get('email', '')
                user.save()

                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.phone_number = request.POST.get('phone_number', '')
                profile.save()
                messages.success(request, 'Profile updated successfully.')

            elif action == 'change_password':
                current_password = request.POST.get('current_password')
                new_password = request.POST.get('new_password')
                confirm_password = request.POST.get('confirm_password')

                if not user.check_password(current_password):
                    messages.error(request, 'Incorrect current password.')
                elif new_password != confirm_password:
                    messages.error(request, 'New passwords do not match.')
                else:
                    user.set_password(new_password)
                    user.save()
                    update_session_auth_hash(
                        request, user)  # Keep user logged in
                    messages.success(request, 'Password changed successfully.')

            elif action == 'update_notifications':
                notifications, _ = UserNotificationSettings.objects.get_or_create(
                    user=user)
                notifications.notify_charging_updates = request.POST.get(
                    'notify_charging_updates') == 'on'
                notifications.notify_station_alerts = request.POST.get(
                    'notify_station_alerts') == 'on'
                notifications.notify_promotional_offers = request.POST.get(
                    'notify_promotional_offers') == 'on'
                notifications.notify_app_updates = request.POST.get(
                    'notify_app_updates') == 'on'
                notifications.save()
                messages.success(request, 'Notification settings updated.')

            elif action == 'update_preferences':  # Example for preferences if we add that tab
                preferences, _ = UserPreferences.objects.get_or_create(
                    user=user)
                # preferences.is_dark_mode = request.POST.get('is_dark_mode') == 'on'
                # preferences.save()
                pass

        except Exception as e:
            messages.error(request, f'An error occurred: {str(e)}')

        return redirect('admin-settings')
