from django.shortcuts import redirect, render
from django.views.generic import TemplateView, ListView, View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db import transaction

from stations.models import Showroom, Brand, Amenity, Address, ShowroomAmenity


class ShowroomRoleRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    """Allow admins and showroom-role users."""
    def test_func(self):
        user = self.request.user
        return user.is_authenticated and (user.is_staff or getattr(user, 'role', None) in ('admin', 'showroom'))


# ─── Dashboard ──────────────────────────────────────────────────────────────

class ShowroomDashboardView(ShowroomRoleRequiredMixin, TemplateView):
    template_name = 'showroom/dashboard_page.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'dashboard'
        
        # Filter statistics by user if not admin
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            user_showrooms = Showroom.objects.filter(created_by=self.request.user)
            context['total_showrooms'] = user_showrooms.count()
            
            # Show all brands (shared lookup data, no owner)
            context['total_brands'] = Brand.objects.count()
            
            # Show all showroom amenities (shared lookup data)
            context['total_amenities'] = Amenity.objects.filter(category='showroom').count()
        else:
            # Admin sees all data
            context['total_showrooms'] = Showroom.objects.count()
            context['total_brands'] = Brand.objects.count()
            context['total_amenities'] = Amenity.objects.filter(category='showroom').count()
        
        return context


# ─── Showrooms ───────────────────────────────────────────────────────────────

class ShowroomListView(ShowroomRoleRequiredMixin, ListView):
    model = Showroom
    template_name = 'showroom/showrooms_list_page.html'
    context_object_name = 'showrooms'

    def get_queryset(self):
        queryset = Showroom.objects.select_related('brand', 'address', 'created_by').order_by('-created_at')
        # Filter by user if not admin
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            queryset = queryset.filter(created_by=self.request.user)
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'showrooms'
        return context


class ShowroomCreateView(ShowroomRoleRequiredMixin, TemplateView):
    template_name = 'showroom/showroom_form_page.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'showrooms'
        context['is_edit'] = False
        context['brands'] = Brand.objects.all()
        context['amenities'] = Amenity.objects.filter(category='showroom')
        context['selected_amenities'] = []
        return context

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                address = Address.objects.create(
                    street=request.POST.get('address', ''),
                    city=request.POST.get('city', ''),
                    state=request.POST.get('state', ''),
                    zip_code=request.POST.get('zip_code', ''),
                    latitude=request.POST.get('latitude') or None,
                    longitude=request.POST.get('longitude') or None,
                )
                brand_id = request.POST.get('brand_id')
                brand = Brand.objects.get(pk=brand_id) if brand_id else None

                showroom = Showroom.objects.create(
                    name=request.POST.get('name'),
                    brand=brand,
                    status=request.POST.get('status', 'active'),
                    opening_hours=request.POST.get('opening_hours'),
                    phone=request.POST.get('phone'),
                    email=request.POST.get('email'),
                    website=request.POST.get('website'),
                    address=address,
                    created_by=request.user
                )
                for am_id in request.POST.getlist('amenities'):
                    try:
                        ShowroomAmenity.objects.create(
                            showroom=showroom,
                            amenity=Amenity.objects.get(id=am_id)
                        )
                    except Amenity.DoesNotExist:
                        continue
            return redirect('admin-showroom-list')
        except Exception as e:
            context = self.get_context_data()
            context['error'] = str(e)
            return self.render_to_response(context)


class ShowroomUpdateView(ShowroomRoleRequiredMixin, TemplateView):
    template_name = 'showroom/showroom_form_page.html'

    def get_showroom(self):
        queryset = Showroom.objects.select_related('brand', 'address', 'created_by')
        # Filter by user if not admin
        if not self.request.user.is_staff and self.request.user.role != 'admin':
            queryset = queryset.filter(created_by=self.request.user)
        return queryset.get(showroom_id=self.kwargs['pk'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        showroom = self.get_showroom()
        context['active_page'] = 'showrooms'
        context['is_edit'] = True
        context['showroom'] = showroom
        context['brands'] = Brand.objects.all()
        context['amenities'] = Amenity.objects.filter(category='showroom')
        context['selected_amenities'] = list(
            showroom.showroom_amenities.values_list('amenity_id', flat=True)
        )
        return context

    def post(self, request, *args, **kwargs):
        showroom = self.get_showroom()
        try:
            with transaction.atomic():
                if showroom.address:
                    showroom.address.street = request.POST.get('address', '')
                    showroom.address.city = request.POST.get('city', '')
                    showroom.address.state = request.POST.get('state', '')
                    showroom.address.zip_code = request.POST.get('zip_code', '')
                    showroom.address.latitude = request.POST.get('latitude') or None
                    showroom.address.longitude = request.POST.get('longitude') or None
                    showroom.address.save()

                brand_id = request.POST.get('brand_id')
                showroom.brand = Brand.objects.get(pk=brand_id) if brand_id else None
                showroom.name = request.POST.get('name')
                showroom.status = request.POST.get('status', 'active')
                showroom.opening_hours = request.POST.get('opening_hours')
                showroom.phone = request.POST.get('phone')
                showroom.email = request.POST.get('email')
                showroom.website = request.POST.get('website')
                showroom.save()

                ShowroomAmenity.objects.filter(showroom=showroom).delete()
                for am_id in request.POST.getlist('amenities'):
                    try:
                        ShowroomAmenity.objects.create(
                            showroom=showroom,
                            amenity=Amenity.objects.get(id=am_id)
                        )
                    except Amenity.DoesNotExist:
                        continue
            return redirect('admin-showroom-list')
        except Exception as e:
            context = self.get_context_data()
            context['error'] = str(e)
            return self.render_to_response(context)


class ShowroomDeleteView(ShowroomRoleRequiredMixin, View):
    def post(self, request, pk):
        # Check if user has permission to delete this showroom
        if not request.user.is_staff and request.user.role != 'admin':
            showroom = Showroom.objects.filter(showroom_id=pk, created_by=request.user).first()
            if not showroom:
                return redirect('admin-showroom-list')  # Or show error
        Showroom.objects.filter(showroom_id=pk).delete()
        return redirect('admin-showroom-list')


# ─── Brands ──────────────────────────────────────────────────────────────────

class BrandListView(ShowroomRoleRequiredMixin, ListView):
    model = Brand
    template_name = 'showroom/brands_list_page.html'
    context_object_name = 'brands'

    def get_queryset(self):
        # Brands are shared lookup data — show all to every showroom portal user
        return Brand.objects.all().order_by('name')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'brands'
        return context


class BrandCreateView(ShowroomRoleRequiredMixin, TemplateView):
    template_name = 'showroom/brand_form_page.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'brands'
        context['is_edit'] = False
        return context

    def post(self, request, *args, **kwargs):
        name = request.POST.get('name', '').strip()
        if not name:
            context = self.get_context_data()
            context['error'] = 'Brand name is required.'
            return self.render_to_response(context)
        Brand.objects.create(name=name)
        return redirect('admin-showroom-brand-list')


class BrandUpdateView(ShowroomRoleRequiredMixin, TemplateView):
    template_name = 'showroom/brand_form_page.html'

    def get_brand(self):
        return Brand.objects.get(brand_id=self.kwargs['pk'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'brands'
        context['is_edit'] = True
        context['brand'] = self.get_brand()
        return context

    def post(self, request, *args, **kwargs):
        brand = self.get_brand()
        name = request.POST.get('name', '').strip()
        if not name:
            context = self.get_context_data()
            context['error'] = 'Brand name is required.'
            return self.render_to_response(context)
        brand.name = name
        brand.save()
        return redirect('admin-showroom-brand-list')


class BrandDeleteView(ShowroomRoleRequiredMixin, View):
    def post(self, request, pk):
        Brand.objects.filter(brand_id=pk).delete()
        return redirect('admin-showroom-brand-list')


# ─── Amenities ───────────────────────────────────────────────────────────────

class ShowroomAmenityListView(ShowroomRoleRequiredMixin, ListView):
    model = Amenity
    template_name = 'showroom/amenities_list_page.html'
    context_object_name = 'amenities'

    def get_queryset(self):
        # Amenities are shared lookup data — show all to every showroom portal user
        return Amenity.objects.filter(category='showroom').order_by('name')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'amenities'
        return context


class ShowroomAmenityCreateView(ShowroomRoleRequiredMixin, TemplateView):
    template_name = 'showroom/amenity_form_page.html'

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
        Amenity.objects.create(name=name, category='showroom')
        return redirect('admin-showroom-amenity-list')


class ShowroomAmenityUpdateView(ShowroomRoleRequiredMixin, TemplateView):
    template_name = 'showroom/amenity_form_page.html'

    def get_amenity(self):
        return Amenity.objects.get(pk=self.kwargs['pk'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_page'] = 'amenities'
        context['is_edit'] = True
        context['amenity'] = self.get_amenity()
        return context

    def post(self, request, *args, **kwargs):
        amenity = self.get_amenity()
        name = request.POST.get('name', '').strip()
        if not name:
            context = self.get_context_data()
            context['error'] = 'Amenity name is required.'
            return self.render_to_response(context)
        amenity.name = name
        amenity.category = 'showroom'
        amenity.save()
        return redirect('admin-showroom-amenity-list')


class ShowroomAmenityDeleteView(ShowroomRoleRequiredMixin, View):
    def post(self, request, pk):
        Amenity.objects.filter(pk=pk).delete()
        return redirect('admin-showroom-amenity-list')
