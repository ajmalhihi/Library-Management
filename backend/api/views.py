from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from datetime import date

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


# ==========================================
# USER MODULE
# ==========================================

class UserBookViewSet(viewsets.ReadOnlyModelViewSet):
    """
    User-facing endpoint to view available books and search.
    Only allows authenticated users with standard USER role.
    """
    permission_classes = [IsAuthenticated, IsUserRole]
    serializer_class = BookSerializer

    def get_queryset(self):
        queryset = Book.objects.all()
        # Default user view is list of books.
        # Support search by title or author
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

        # Validation: Check if book is available
        if not book.is_available:
            return Response(
                {"error": "This book is currently unavailable (already borrowed)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validation: Check if user already borrowed this book and hasn't returned it
        already_borrowed = Rental.objects.filter(
            user=user, 
            book=book, 
            is_returned=False
        ).exists()
        
        if already_borrowed:
            return Response(
                {"error": "You already have an active rental for this book. Please return it first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Transaction: Create rental and update book availability status
        rental = Rental.objects.create(user=user, book=book)
        book.is_available = False
        book.save()

        return Response(
            {
                "message": f"Successfully borrowed '{book.title}'!",
                "rental": RentalDetailedSerializer(rental).data
            },
            status=status.HTTP_210_CREATED if hasattr(status, 'HTTP_210_CREATED') else status.HTTP_201_CREATED
        )


class UserRentalViewSet(viewsets.ViewSet):
    """
    User-facing endpoint to manage active rentals, history, and returns.
    """
    permission_classes = [IsAuthenticated, IsUserRole]

    @action(detail=False, methods=['get'], url_path='my-dashboard')
    def my_dashboard(self, request):
        """
        List active rentals (currently borrowed books + due dates)
        """
        active_rentals = Rental.objects.filter(user=request.user, is_returned=False).order_by('due_date')
        serializer = RentalDetailedSerializer(active_rentals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='history')
    def history(self, request):
        """
        List full borrowing history (both active and returned)
        """
        history_rentals = Rental.objects.filter(user=request.user).order_by('-borrow_date')
        serializer = RentalDetailedSerializer(history_rentals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='return')
    def return_book(self, request, pk=None):
        """
        Return a book. Checked to belong to the logged-in user.
        """
        try:
            rental = Rental.objects.get(pk=pk)
        except Rental.DoesNotExist:
            return Response(
                {"error": "Rental record not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validation: Check if rental belongs to current logged-in user
        if rental.user != request.user:
            return Response(
                {"error": "Access Denied: This rental record does not belong to you."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validation: Check if already returned
        if rental.is_returned:
            return Response(
                {"error": "This book has already been returned."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Transaction: Mark returned
        rental.is_returned = True
        rental.return_date = date.today()
        rental.save()

        # Mark book as available
        book = rental.book
        book.is_available = True
        book.save()

        return Response({
            "message": f"Successfully returned '{book.title}'!",
            "rental": RentalDetailedSerializer(rental).data
        }, status=status.HTTP_200_OK)


# ==========================================
# ADMIN MODULE
# ==========================================

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        total_books = Book.objects.count()
        total_users = User.objects.filter(role='USER').count() # Only count standard library users
        currently_borrowed = Rental.objects.filter(is_returned=False).count()
        
        # Overdue rentals count
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
    """
    CRUD endpoint for Admin to manage books.
    Only allows access to users with ADMIN role.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    serializer_class = BookSerializer
    queryset = Book.objects.all().order_by('title')

    def destroy(self, request, *args, **kwargs):
        book = self.get_object()
        # Validation: Prevent deletion of book if it's currently borrowed
        is_borrowed = Rental.objects.filter(book=book, is_returned=False).exists()
        if is_borrowed:
            return Response(
                {"error": f"Cannot delete '{book.title}'. It is currently borrowed. Please wait until it is returned."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class AdminRentalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin-facing view to inspect all rentals in the system.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    serializer_class = RentalDetailedSerializer
    queryset = Rental.objects.all().order_by('-borrow_date')

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue(self, request):
        """
        List only overdue rentals with borrower details
        """
        today = date.today()
        overdue_rentals = Rental.objects.filter(
            is_returned=False, 
            due_date__lt=today
        ).order_by('due_date')
        serializer = RentalDetailedSerializer(overdue_rentals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUserListView(APIView):
    """
    Admin-facing view to fetch registered library users.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        # We fetch all users except Django superusers if we want a clean user database,
        # or we list all. Let's list all registered users.
        users = User.objects.all().order_by('first_name')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
