from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from datetime import date, timedelta

from .models import Book, Rental

User = get_user_model()

class LibraryAPITests(APITestCase):

    def setUp(self):
        # Create standard user
        self.user = User.objects.create_user(
            email="user@library.com",
            password="password123",
            first_name="Jane User",
            role="USER"
        )
        
        # Create admin user
        self.admin = User.objects.create_user(
            email="admin@library.com",
            password="password123",
            first_name="John Admin",
            role="ADMIN"
        )

        # Create some test books
        self.book1 = Book.objects.create(
            title="Clean Code",
            author="Robert C. Martin",
            genre="Software Engineering",
            description="A handbook of agile software craftsmanship.",
            is_available=True
        )
        self.book2 = Book.objects.create(
            title="Design Patterns",
            author="Gang of Four",
            genre="Software Engineering",
            description="Elements of Reusable Object-Oriented Software.",
            is_available=False # Initialized as borrowed
        )

        # URL reverse paths
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.me_url = reverse('auth-me')
        self.admin_dashboard_url = reverse('admin-dashboard')
        self.admin_users_url = reverse('admin-users')

    def get_jwt_token(self, email, password):
        response = self.client.post(self.login_url, {"email": email, "password": password})
        return response.data['access']

    # ==========================================
    # AUTHENTICATION TESTS
    # ==========================================

    def test_user_registration_success(self):
        data = {
            "name": "New User",
            "email": "newuser@library.com",
            "password": "securepassword123",
            "confirm_password": "securepassword123",
            "role": "USER"
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["user"]["email"], "newuser@library.com")

    def test_user_registration_validation_errors(self):
        # Short password
        data = {
            "name": "Bad User",
            "email": "baduser@library.com",
            "password": "123",
            "confirm_password": "123",
            "role": "USER"
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Password mismatch
        data["password"] = "securepassword123"
        data["confirm_password"] = "differentpassword123"
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", response.data)

        # Duplicate email
        data["confirm_password"] = "securepassword123"
        data["email"] = "user@library.com" # Existing
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        data = {
            "email": "user@library.com",
            "password": "password123"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["user"]["role"], "USER")

    def test_login_failure(self):
        data = {
            "email": "user@library.com",
            "password": "wrongpassword"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_410_UNAUTHORIZED if hasattr(status, 'HTTP_410_UNAUTHORIZED') else status.HTTP_401_UNAUTHORIZED)

    # ==========================================
    # ROLE-BASED ACCESS CONTROL TESTS
    # ==========================================

    def test_admin_dashboard_protected_from_standard_user(self):
        token = self.get_jwt_token("user@library.com", "password123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        response = self.client.get(self.admin_dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_dashboard_accessible_by_admin(self):
        token = self.get_jwt_token("admin@library.com", "password123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        response = self.client.get(self.admin_dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_books", response.data)

    # ==========================================
    # BOOK & ADMIN CRUD TESTS
    # ==========================================

    def test_admin_create_book_success(self):
        token = self.get_jwt_token("admin@library.com", "password123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        data = {
            "title": "Refactoring",
            "author": "Martin Fowler",
            "genre": "Software Engineering",
            "description": "Improving the design of existing code.",
            "is_available": True
        }
        url = reverse('admin-books-list')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Book.objects.filter(title="Refactoring").count(), 1)

    def test_admin_create_book_duplicate_title(self):
        token = self.get_jwt_token("admin@library.com", "password123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        data = {
            "title": "Clean Code", # Already exists
            "author": "Someone Else",
            "genre": "Programming",
            "description": "Blah blah.",
            "is_available": True
        }
        url = reverse('admin-books-list')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_user_cannot_create_book(self):
        token = self.get_jwt_token("user@library.com", "password123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        data = {
            "title": "Unauthorized Book",
            "author": "Hacker",
            "genre": "Security",
            "description": "Forbidden details.",
            "is_available": True
        }
        url = reverse('admin-books-list')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ==========================================
    # USER BORROW & RETURN MODULE TESTS
    # ==========================================

    def test_borrow_available_book_success(self):
        token = self.get_jwt_token("user@library.com", "password123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        url = reverse('user-books-borrow', kwargs={'pk': self.book1.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_210_CREATED if hasattr(status, 'HTTP_210_CREATED') else status.HTTP_201_CREATED)
        
        # Verify book status changed immediately
        self.book1.refresh_from_db()
        self.assertFalse(self.book1.is_available)
        
        # Verify rental created
        rental = Rental.objects.get(book=self.book1, user=self.user)
        self.assertFalse(rental.is_returned)
        self.assertEqual(rental.due_date, date.today() + timedelta(days=14))

    def test_borrow_unavailable_book_fails(self):
        token = self.get_jwt_token("user@library.com", "password123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        # self.book2 was set as unavailable in setUp
        url = reverse('user-books-borrow', kwargs={'pk': self.book2.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_return_borrowed_book_success(self):
        token = self.get_jwt_token("user@library.com", "password123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        # Create a rental for this user
        rental = Rental.objects.create(user=self.user, book=self.book2)
        
        url = reverse('user-rentals-return-book', kwargs={'pk': rental.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify book availability restored immediately
        self.book2.refresh_from_db()
        self.assertTrue(self.book2.is_available)
        
        # Verify rental updated
        rental.refresh_from_db()
        self.assertTrue(rental.is_returned)
        self.assertEqual(rental.return_date, date.today())

    def test_return_other_users_book_fails(self):
        # Create a rental for another user (e.g. the admin user)
        rental = Rental.objects.create(user=self.admin, book=self.book2)
        
        # Log in as the standard user
        token = self.get_jwt_token("user@library.com", "password123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        url = reverse('user-rentals-return-book', kwargs={'pk': rental.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("error", response.data)
