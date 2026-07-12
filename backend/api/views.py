from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from datetime import date, timedelta

from .models import Book, Rental
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    BookSerializer,
    RentalSerializer,
    RentalDetailedSerializer
)
from .permissions import IsAdminUserRole, IsUserRole

User = get_user_model()

# ==========================================
# AUTHENTICATION MODULE
# ==========================================

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Registration successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {"error": "Both email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(email=email, password=password)

        if user is not None:
            if not user.is_active:
                return Response(
                    {"error": "This account is inactive. Please contact administration."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid email or password. Please try again."},
                status=status.HTTP_401_UNAUTHORIZED
            )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        name = request.data.get('name', '').strip()
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        errors = {}

        if name:
            user.first_name = name

        if new_password:
            if not current_password:
                errors['current_password'] = 'Current password is required to set a new password.'
            elif not user.check_password(current_password):
                errors['current_password'] = 'Current password is incorrect.'
            elif len(new_password) < 8:
                errors['new_password'] = 'New password must be at least 8 characters.'
            elif new_password != confirm_password:
                errors['confirm_password'] = 'Passwords do not match.'
            else:
                user.set_password(new_password)

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user.save()
        return Response({
            "message": "Profile updated successfully.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


# ==========================================
# USER MODULE
# ==========================================

class UserBookViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsUserRole]
    serializer_class = BookSerializer

    def get_queryset(self):
        queryset = Book.objects.all()
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(author__icontains=search_query)
            )
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsUserRole])
    def borrow(self, request, pk=None):
        book = self.get_object()
        user = request.user

        if not book.is_available:
            return Response(
                {"error": "This book is currently unavailable (already borrowed)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        already_borrowed = Rental.objects.filter(
            user=user,
            book=book,
            is_returned=False
        ).exists()

        if already_borrowed:
            return Response(
                {"error": "You already have an active rental for this book."},
                status=status.HTTP_400_BAD_REQUEST
            )

        rental = Rental.objects.create(user=user, book=book)
        book.is_available = False
        book.save()

        return Response(
            {
                "message": f"Successfully borrowed '{book.title}'!",
                "rental": RentalDetailedSerializer(rental).data
            },
            status=status.HTTP_201_CREATED
        )


class UserRentalViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsUserRole]

    def auto_return_expired_books(self):
        rentals = Rental.objects.filter(is_returned=False)
        for rental in rentals:
            rental.check_auto_return()

    @action(detail=False, methods=['get'], url_path='my-dashboard')
    def my_dashboard(self, request):
        self.auto_return_expired_books()
        active_rentals = Rental.objects.filter(
            user=request.user,
            is_returned=False
        ).order_by('due_date')
        serializer = RentalDetailedSerializer(active_rentals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='history')
    def history(self, request):
        self.auto_return_expired_books()
        history_rentals = Rental.objects.filter(
            user=request.user
        ).order_by('-borrow_date')
        serializer = RentalDetailedSerializer(history_rentals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='return')
    def return_book(self, request, pk=None):
        try:
            rental = Rental.objects.get(pk=pk, user=request.user)
        except Rental.DoesNotExist:
            return Response(
                {"error": "Rental record not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if rental.is_returned:
            return Response(
                {"error": "This book has already been returned."},
                status=status.HTTP_400_BAD_REQUEST
            )

        rental.is_returned = True
        rental.return_date = date.today()
        rental.save()

        book = rental.book
        book.is_available = True
        book.save()

        return Response(
            {
                "message": f"Successfully returned '{book.title}'!",
                "rental": RentalDetailedSerializer(rental).data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='renew')
    def renew(self, request, pk=None):
        try:
            rental = Rental.objects.get(pk=pk, user=request.user)
        except Rental.DoesNotExist:
            return Response(
                {"error": "Rental record not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        rental.check_auto_return()

        if rental.is_returned:
            return Response(
                {"error": "This rental has already expired and was automatically returned."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not rental.can_renew:
            return Response(
                {"error": "Maximum renewal limit of 2 reached."},
                status=status.HTTP_400_BAD_REQUEST
            )

        rental.due_date += timedelta(days=14)
        rental.renewal_count += 1
        rental.save()

        return Response(
            {
                "message": f"'{rental.book.title}' renewed successfully for 14 more days.",
                "renewal_count": rental.renewal_count,
                "new_due_date": rental.due_date,
                "rental": RentalDetailedSerializer(rental).data
            },
            status=status.HTTP_200_OK
        )


# ==========================================
# ADMIN MODULE
# ==========================================

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        # Auto return all overdue books
        overdue_rentals = Rental.objects.filter(is_returned=False)
        for rental in overdue_rentals:
            rental.check_auto_return()

        total_books = Book.objects.count()
        total_users = User.objects.filter(role='USER').count()
        currently_borrowed = Rental.objects.filter(is_returned=False).count()
        today = date.today()
        overdue_rentals_count = Rental.objects.filter(
            is_returned=False,
            due_date__lt=today
        ).count()

        return Response({
            "total_books": total_books,
            "total_users": total_users,
            "currently_borrowed": currently_borrowed,
            "overdue_rentals_count": overdue_rentals_count
        }, status=status.HTTP_200_OK)


class AdminBookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    serializer_class = BookSerializer
    queryset = Book.objects.all().order_by('title')

    def destroy(self, request, *args, **kwargs):
        book = self.get_object()
        is_borrowed = Rental.objects.filter(book=book, is_returned=False).exists()
        if is_borrowed:
            return Response(
                {"error": f"Cannot delete '{book.title}'. It is currently borrowed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class AdminRentalViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    serializer_class = RentalDetailedSerializer
    queryset = Rental.objects.all().order_by('-borrow_date')

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue(self, request):
        today = date.today()
        overdue_rentals = Rental.objects.filter(
            is_returned=False,
            due_date__lt=today
        ).order_by('due_date')
        serializer = RentalDetailedSerializer(overdue_rentals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        users = User.objects.all().order_by('first_name')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)