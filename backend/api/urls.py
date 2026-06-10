from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    MeView,
    UserBookViewSet,
    UserRentalViewSet,
    AdminDashboardView,
    AdminBookViewSet,
    AdminRentalViewSet,
    AdminUserListView
)

router = DefaultRouter()
# User endpoints
router.register(r'books', UserBookViewSet, basename='user-books')
router.register(r'rentals', UserRentalViewSet, basename='user-rentals')

# Admin CRUD endpoints
router.register(r'admin/books', AdminBookViewSet, basename='admin-books')
router.register(r'admin/rentals', AdminRentalViewSet, basename='admin-rentals')

urlpatterns = [
    # Authentication Module
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),

    # Admin Dashboard & Users
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),

    # ViewSet Router URLs
    path('', include(router.urls)),
]
