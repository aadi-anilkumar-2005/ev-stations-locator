
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
        return (self.request.user.is_authenticated and self.request.user.is_staff)

class AdminLoginView(LoginView):
    template_name = 'admin/auth/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        if hasattr(self.request.user, 'role'):
            if (self.request.user.role == 'service'):
                return reverse_lazy('service-center-portal')
            elif (self.request.user.role == 'showroom'):
                return reverse_lazy('admin-showroom-dashboard')
            elif (self.request.user.role == 'station'):
                return reverse_lazy('admin-cs-dashboard')
        return reverse_lazy('admin-dashboard')

    def form_invalid(self, form):
        return self.render_to_response(self.get_context_data(form=form, error='Invalid email or password'))

class AdminLogoutView(LogoutView):
    next_page = reverse_lazy('admin-login')

class AdminDashboardView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/dashboard/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from stations.models import Station, Showroom, ServiceCenter
        from django.contrib.auth import get_user_model
        from django.db.models import Count, Q
        User = get_user_model()
        total_stations = Station.objects.count()
        total_users = User.objects.count()
        total_showrooms = Showroom.objects.count()
        total_service = ServiceCenter.objects.count()
        context['stats'] = {'total_stations': total_stations, 'total_users': total_users, 'total_locations': (total_showrooms + total_service), 'active_stations': Station.objects.filter(status='active').count()}
        status_counts = Station.objects.values('status').annotate(count=Count('status'))
        formatted_status = []
        for item in status_counts:
            count = item['count']
            percentage = (((count / total_stations) * 100) if (total_stations > 0) else 0)
            formatted_status.append({'status': item['status'], 'count': count, 'percentage': round(percentage, 1), 'color': self._get_status_color(item['status'])})
        context['station_status'] = formatted_status
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_stations = Station.objects.order_by('-created_at')[:5]
        activity = []
        for user in recent_users:
            activity.append({'type': 'New User', 'desc': f'{user.username} joined the platform', 'time': user.date_joined, 'icon': 'user-plus', 'color': 'text-primary', 'bg': 'bg-primary-subtle'})
        for station in recent_stations:
            activity.append({'type': 'New Station', 'desc': f'{station.name} was added', 'time': station.created_at, 'icon': 'zap', 'color': 'text-emerald', 'bg': 'bg-emerald-subtle'})
        activity.sort(key=(lambda x: x['time']), reverse=True)
        context['recent_activity'] = activity[:8]
        return context

    def _get_status_color(self, status):
        if (status == 'active'):
            return 'bg-emerald'
        if (status == 'maintenance'):
            return 'bg-warning'
        return 'bg-secondary'

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

class AdminShowroomsView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/showrooms/showrooms.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        showrooms_list = Showroom.objects.select_related('address', 'brand').all().order_by('-created_at')
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
                address = Address.objects.create(street=request.POST.get('address'), city=request.POST.get('city'), state=request.POST.get('state'), zip_code=request.POST.get('zip_code'), latitude=(request.POST.get('latitude') or None), longitude=(request.POST.get('longitude') or None))
                brand_id = request.POST.get('brand_id')
                brand = (Brand.objects.get(pk=brand_id) if brand_id else None)
                showroom = Showroom.objects.create(name=request.POST.get('name'), brand=brand, status=request.POST.get('status', 'active'), opening_hours=request.POST.get('opening_hours'), phone=request.POST.get('phone'), email=request.POST.get('email'), website=request.POST.get('website'), address=address)
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        ShowroomAmenity.objects.create(showroom=showroom, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue
            return redirect('admin-showrooms')
        except Exception as e:
            print(f'Error creating showroom: {e}')
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
    fields = ['name', 'status', 'opening_hours', 'phone', 'email', 'website']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = True
        from stations.models import Brand
        context['brands'] = Brand.objects.all()
        context['amenities'] = Amenity.objects.filter(category='showroom')
        showroom = self.get_object()
        context['selected_amenities'] = list(showroom.showroom_amenities.values_list('amenity_id', flat=True))
        return context

    def post(self, request, *args, **kwargs):
        showroom = self.get_object()
        try:
            with transaction.atomic():
                from stations.models import Brand, ShowroomAmenity
                address = showroom.address
                if address:
                    address.street = request.POST.get('address')
                    address.city = request.POST.get('city')
                    address.state = request.POST.get('state')
                    address.zip_code = request.POST.get('zip_code')
                    address.latitude = (request.POST.get('latitude') or None)
                    address.longitude = (request.POST.get('longitude') or None)
                    address.save()
                showroom.name = request.POST.get('name')
                brand_id = request.POST.get('brand_id')
                showroom.brand = (Brand.objects.get(pk=brand_id) if brand_id else None)
                showroom.status = request.POST.get('status', 'active')
                showroom.opening_hours = request.POST.get('opening_hours')
                showroom.phone = request.POST.get('phone')
                showroom.email = request.POST.get('email')
                showroom.website = request.POST.get('website')
                showroom.save()
                ShowroomAmenity.objects.filter(showroom=showroom).delete()
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        ShowroomAmenity.objects.create(showroom=showroom, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue
            return redirect('admin-showrooms')
        except Exception as e:
            print(f'Error updating showroom: {e}')
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
        service_centers = ServiceCenter.objects.select_related('address').all().order_by('-created_at')
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
                address = Address.objects.create(street=request.POST.get('address'), city=request.POST.get('city'), state=request.POST.get('state'), zip_code=request.POST.get('zip_code'), latitude=(request.POST.get('latitude') or None), longitude=(request.POST.get('longitude') or None))
                service_center = ServiceCenter.objects.create(name=request.POST.get('name'), status=request.POST.get('status', 'active'), is_emergency_service=(request.POST.get('is_emergency_service') == 'on'), opening_hours=request.POST.get('opening_hours'), phone=request.POST.get('phone'), email=request.POST.get('email'), website=request.POST.get('website'), address=address)
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        ServiceAmenity.objects.create(service=service_center, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue
            return redirect('admin-service-centers')
        except Exception as e:
            print(f'Error creating service center: {e}')
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
    fields = ['name', 'status', 'opening_hours', 'phone', 'email', 'website', 'is_emergency_service']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_edit'] = True
        context['amenities'] = Amenity.objects.filter(category='service')
        service_center = self.get_object()
        context['selected_amenities'] = list(service_center.service_amenities.values_list('amenity_id', flat=True))
        return context

    def post(self, request, *args, **kwargs):
        service_center = self.get_object()
        try:
            with transaction.atomic():
                from stations.models import ServiceAmenity
                address = service_center.address
                if address:
                    address.street = request.POST.get('address')
                    address.city = request.POST.get('city')
                    address.state = request.POST.get('state')
                    address.zip_code = request.POST.get('zip_code')
                    address.latitude = (request.POST.get('latitude') or None)
                    address.longitude = (request.POST.get('longitude') or None)
                    address.save()
                service_center.name = request.POST.get('name')
                service_center.status = request.POST.get('status', 'active')
                service_center.is_emergency_service = (request.POST.get('is_emergency_service') == 'on')
                service_center.opening_hours = request.POST.get('opening_hours')
                service_center.phone = request.POST.get('phone')
                service_center.email = request.POST.get('email')
                service_center.website = request.POST.get('website')
                service_center.save()
                ServiceAmenity.objects.filter(service=service_center).delete()
                amenity_ids = request.POST.getlist('amenities')
                for am_id in amenity_ids:
                    try:
                        amenity = Amenity.objects.get(id=am_id)
                        ServiceAmenity.objects.create(service=service_center, amenity=amenity)
                    except Amenity.DoesNotExist:
                        continue
            return redirect('admin-service-centers')
        except Exception as e:
            print(f'Error updating service center: {e}')
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
        queryset = User.objects.select_related('profile').all().order_by('-date_joined')
        search_query = self.request.GET.get('search', '')
        if search_query:
            queryset = ((queryset.filter(username__icontains=search_query) | queryset.filter(email__icontains=search_query)) | queryset.filter(full_name__icontains=search_query))
        status_filter = self.request.GET.get('status', 'all')
        if (status_filter == 'active'):
            queryset = queryset.filter(is_active=True)
        elif (status_filter == 'inactive'):
            queryset = queryset.filter(is_active=False)
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = (total_users - active_users)
        context['stats'] = {'total': total_users, 'active': active_users, 'inactive': inactive_users, 'new_this_month': User.objects.filter(date_joined__month=7).count()}
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
        if (not user.username):
            import uuid
            base_username = user.email.split('@')[0]
            user.username = f'{base_username}_{uuid.uuid4().hex[:8]}'
        password = self.request.POST.get('password')
        if password:
            user.set_password(password)
        else:
            pass
        user.save()
        phone_number = self.request.POST.get('phone_number')
        if phone_number:
            from users.models import UserProfile
            UserProfile.objects.update_or_create(user=user, defaults={'phone_number': phone_number})
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
        phone_number = self.request.POST.get('phone_number')
        from users.models import UserProfile
        UserProfile.objects.update_or_create(user=user, defaults={'phone_number': phone_number})
        return redirect(self.success_url)

class AdminDeleteUserView(AdminRequiredMixin, DeleteView):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    model = User
    success_url = reverse_lazy('admin-users')

class AdminSettingsView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/settings/settings.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        from users.models import UserProfile, UserPreferences, UserNotificationSettings
        UserProfile.objects.get_or_create(user=user)
        UserPreferences.objects.get_or_create(user=user)
        UserNotificationSettings.objects.get_or_create(user=user)
        context['user'] = user
        return context

    def post(self, request, *args, **kwargs):
        user = request.user
        from django.contrib import messages
        from django.contrib.auth import update_session_auth_hash
        from users.models import UserProfile, UserPreferences, UserNotificationSettings
        action = request.POST.get('action')
        try:
            if (action == 'update_profile'):
                user.full_name = request.POST.get('full_name', '')
                user.email = request.POST.get('email', '')
                user.save()
                (profile, _) = UserProfile.objects.get_or_create(user=user)
                profile.phone_number = request.POST.get('phone_number', '')
                profile.save()
                messages.success(request, 'Profile updated successfully.')
            elif (action == 'change_password'):
                current_password = request.POST.get('current_password')
                new_password = request.POST.get('new_password')
                confirm_password = request.POST.get('confirm_password')
                if (not user.check_password(current_password)):
                    messages.error(request, 'Incorrect current password.')
                elif (new_password != confirm_password):
                    messages.error(request, 'New passwords do not match.')
                else:
                    user.set_password(new_password)
                    user.save()
                    update_session_auth_hash(request, user)
                    messages.success(request, 'Password changed successfully.')
            elif (action == 'update_notifications'):
                (notifications, _) = UserNotificationSettings.objects.get_or_create(user=user)
                notifications.notify_charging_updates = (request.POST.get('notify_charging_updates') == 'on')
                notifications.notify_station_alerts = (request.POST.get('notify_station_alerts') == 'on')
                notifications.notify_promotional_offers = (request.POST.get('notify_promotional_offers') == 'on')
                notifications.notify_app_updates = (request.POST.get('notify_app_updates') == 'on')
                notifications.save()
                messages.success(request, 'Notification settings updated.')
            elif (action == 'update_preferences'):
                (preferences, _) = UserPreferences.objects.get_or_create(user=user)
                pass
        except Exception as e:
            messages.error(request, f'An error occurred: {str(e)}')
        return redirect('admin-settings')
