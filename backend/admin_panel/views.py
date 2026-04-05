from django.views import View
from django.views.generic import TemplateView, FormView, RedirectView, DetailView, UpdateView, DeleteView, ListView, CreateView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.urls import reverse_lazy
from django.shortcuts import redirect, render, get_object_or_404
from django.db import transaction
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from stations.models import Station, Address, Amenity, StationAmenity, ChargerType, StationCharger, Showroom
from users.models import PartnerRegistration, UserProfile
import json

class AdminRequiredMixin(UserPassesTestMixin):

    def test_func(self):
        return (self.request.user.is_authenticated and self.request.user.is_staff)

class AdminLoginView(LoginView):
    template_name = 'admin/auth/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'role'):
            if user.role == 'station':
                return reverse_lazy('admin-cs-dashboard')
            elif user.role == 'showroom':
                return reverse_lazy('admin-showroom-dashboard')
            elif user.role == 'service':
                return reverse_lazy('service-center-portal')
        return reverse_lazy('admin-dashboard')

    def form_invalid(self, form):
        return self.render_to_response(self.get_context_data(form=form, error='Invalid email or password'))

class AdminLogoutView(LogoutView):
    next_page = reverse_lazy('admin-login')
    http_method_names = ['get', 'post', 'options']

    def _do_logout(self, request):
        from django.contrib.auth import logout as django_logout
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

class AdminStationsView(AdminRequiredMixin, TemplateView):
    template_name = 'admin/stations/stations.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        stations_list = Station.objects.select_related('address').all().order_by('-created_at')
        paginator = Paginator(stations_list, 10)
        page_number = self.request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        context['stations'] = page_obj
        context['page_obj'] = page_obj
        return context

class AdminStationDetailView(AdminRequiredMixin, DetailView):
    model = Station
    template_name = 'admin/stations/station_detail.html'
    context_object_name = 'station'

class AdminStationDeleteView(AdminRequiredMixin, DeleteView):
    model = Station
    success_url = reverse_lazy('admin-stations')

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

class AdminShowroomDetailView(AdminRequiredMixin, DetailView):
    model = Showroom
    template_name = 'admin/showrooms/showroom_detail.html'
    context_object_name = 'showroom'

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

class AdminServiceCenterDetailView(AdminRequiredMixin, DetailView):
    from stations.models import ServiceCenter
    model = ServiceCenter
    template_name = 'admin/service_centers/service_center_detail.html'
    context_object_name = 'service_center'

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
            
        role_filter = self.request.GET.get('role', 'all')
        if role_filter != 'all':
            queryset = queryset.filter(role=role_filter)
            
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = (total_users - active_users)
        context['stats'] = {'total': total_users, 'active': active_users, 'inactive': inactive_users, 'new_this_month': User.objects.filter(date_joined__month=7).count()}
        
        context['current_search'] = self.request.GET.get('search', '')
        context['current_status'] = self.request.GET.get('status', 'all')
        context['current_role'] = self.request.GET.get('role', 'all')
        return context

class AdminAddUserView(AdminRequiredMixin, CreateView):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    model = User
    template_name = 'admin/users/add-user.html'
    fields = ['full_name', 'email']
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
            
        user.is_staff = True
        user.role = 'admin'
        user.is_active = True
        
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

class AdminToggleUserStatusView(AdminRequiredMixin, View):
    def post(self, request, pk, *args, **kwargs):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = get_object_or_404(User, pk=pk)
        user.is_active = not user.is_active
        user.save()
        messages.success(request, f"User {user.username} status changed to {'Active' if user.is_active else 'Inactive'}.")
        return redirect('admin-users')

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

class PartnerRegistrationCreateView(View):
    def get(self, request):
        return render(request, 'admin/auth/register.html')

    def post(self, request):
        business_name = request.POST.get('business_name')
        category = request.POST.get('category')
        email = request.POST.get('email')
        phone_number = request.POST.get('phone_number')
        password = request.POST.get('password')
        gst_number = request.POST.get('gst_number')
        document = request.FILES.get('document')

        # Basic Check
        if not all([business_name, category, email, phone_number, password, document]):
            messages.error(request, "Please fill in all required fields.")
            return redirect('partner_register')

        # Hash the password
        # Do not use set_password since this is not a User model yet, store it safely
        hashed_password = make_password(password)

        PartnerRegistration.objects.create(
            business_name=business_name,
            category=category,
            email=email,
            phone_number=phone_number,
            password_hash=hashed_password,
            gst_number=gst_number,
            document_url=document,
        )
        
        messages.success(request, "Registration Submitted!")
        return redirect('partner_register')

class AdminRegistrationApprovalListView(View):
    def get(self, request):
        if not request.user.is_authenticated or request.user.role != 'admin':
            return redirect('admin-login')
        
        pending_registrations = PartnerRegistration.objects.filter(status='pending')
        # We can also load approved and rejected if needed for stats
        stats = {
            'pending': pending_registrations.count(),
            'approved': PartnerRegistration.objects.filter(status='approved').count(),
            'rejected': PartnerRegistration.objects.filter(status='rejected').count(),
        }

        context = {
            'registrations': pending_registrations,
            'stats': stats
        }
        return render(request, 'admin/registration_approve.html', context)


class PartnerRegistrationApproveView(View):
    def post(self, request, pk):
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({"error": "Unauthorized"}, status=403)
            
        registration = get_object_or_404(PartnerRegistration, request_id=pk)
        
        if registration.status != 'pending':
            messages.error(request, "Registration is not in pending status.")
            return redirect('admin_approvals')
            
        # Create user
        User = get_user_model()
        if User.objects.filter(email=registration.email).exists():
            messages.error(request, "A user with this email already exists.")
            return redirect('admin_approvals')
            
        user = User.objects.create(
            username=registration.email,
            email=registration.email,
            full_name=registration.business_name,
            role=registration.category,  # category matches 'station', 'showroom', 'service' exactly
        )
        # Assign the pre-hashed password directly (no double-hashing)
        user.password = registration.password_hash
        user.save()

        # Update Registration status
        registration.status = 'approved'
        registration.action_by_admin = request.user
        registration.save()
        
        messages.success(request, f"Registration {registration.request_id} has been approved.")
        return redirect('admin_approvals')


class PartnerRegistrationRejectView(View):
    def post(self, request, pk):
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({"error": "Unauthorized"}, status=403)
            
        registration = get_object_or_404(PartnerRegistration, request_id=pk)
        
        if registration.status != 'pending':
            messages.error(request, "Registration is not in pending status.")
            return redirect('admin_approvals')
            
        rejection_reason = request.POST.get('rejection_reason', '')
        
        registration.status = 'rejected'
        registration.rejection_reason = rejection_reason
        registration.action_by_admin = request.user
        registration.save()
        
        messages.success(request, f"Registration {registration.request_id} has been rejected.")
        return redirect('admin_approvals')
