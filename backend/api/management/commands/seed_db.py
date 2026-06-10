from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Book, Rental
from datetime import date, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with test users, books, and rentals'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing existing database...")
        Rental.objects.all().delete()
        Book.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write("Seeding database...")

        # 1. Create Users
        admin_user = User.objects.create_user(
            email="admin@library.com",
            password="password123",
            first_name="Alice Admin",
            role="ADMIN"
        )
        jane_user = User.objects.create_user(
            email="user1@library.com",
            password="password123",
            first_name="Jane Doe",
            role="USER"
        )
        bob_user = User.objects.create_user(
            email="user2@library.com",
            password="password123",
            first_name="Bob Smith",
            role="USER"
        )

        self.stdout.write(f"Created users: {admin_user.email}, {jane_user.email}, {bob_user.email}")

        # 2. Create Books with real popular names and cover images
        books_data = [
            {
                "title": "Harry Potter and the Sorcerer's Stone",
                "author": "J.K. Rowling",
                "genre": "Fantasy",
                "description": "The iconic adventure of a young wizard discovering his magical heritage at Hogwarts School of Witchcraft and Wizardry.",
                "image_url": "https://images.unsplash.com/photo-1598153346810-8b0daaed53c6?auto=format&fit=crop&q=80&w=600",
                "is_available": True
            },
            {
                "title": "Atomic Habits",
                "author": "James Clear",
                "genre": "Self-Help",
                "description": "An extremely practical guide to breaking bad habits and building good ones, showing how tiny changes can lead to remarkable results.",
                "image_url": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600",
                "is_available": True
            },
            {
                "title": "1984",
                "author": "George Orwell",
                "genre": "Classics",
                "description": "A haunting dystopian masterpiece that depicts a totalitarian regime ruled by Big Brother, examining surveillance, truth, and individual freedom.",
                "image_url": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=600",
                "is_available": True
            },
            {
                "title": "Sapiens: A Brief History of Humankind",
                "author": "Yuval Noah Harari",
                "genre": "History",
                "description": "A fascinating narrative charting the bold history of our species, from insignificant prehistoric apes to the rulers of planet Earth.",
                "image_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600",
                "is_available": True
            },
            {
                "title": "The Great Gatsby",
                "author": "F. Scott Fitzgerald",
                "genre": "Classics",
                "description": "A vivid story set in the roaring twenties, examining the American Dream through the mysterious self-made millionaire Jay Gatsby.",
                "image_url": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600",
                "is_available": True
            },
            {
                "title": "Thinking, Fast and Slow",
                "author": "Daniel Kahneman",
                "genre": "Psychology",
                "description": "A deep tour of the mind, outlining the two cognitive systems that drive our choices: fast, emotional thinking, and slow, logical thinking.",
                "image_url": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=600",
                "is_available": True
            },
            {
                "title": "Clean Code",
                "author": "Robert C. Martin",
                "genre": "Computer Science",
                "description": "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. A handbook of agile software craftsmanship.",
                "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600",
                "is_available": True
            },
            {
                "title": "The Hobbit",
                "author": "J.R.R. Tolkien",
                "genre": "Fantasy",
                "description": "A magical prelude to the Lord of the Rings, following Bilbo Baggins as he is swept into an epic quest to reclaim a lost treasure from a dragon.",
                "image_url": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600",
                "is_available": True
            }
        ]

        books = []
        for data in books_data:
            book = Book.objects.create(**data)
            books.append(book)

        self.stdout.write(f"Created {len(books)} books.")

        # 3. Create Rentals
        # Rental 1: Active rental for Jane Doe (due in 10 days) -> "Harry Potter"
        book_jane_active = books[0]
        rental1 = Rental.objects.create(
            user=jane_user,
            book=book_jane_active,
            due_date=date.today() + timedelta(days=10)
        )
        book_jane_active.is_available = False
        book_jane_active.save()

        # Rental 2: Returned rental for Jane Doe (past) -> "1984"
        book_jane_returned = books[2]
        rental2 = Rental.objects.create(
            user=jane_user,
            book=book_jane_returned,
            due_date=date.today() - timedelta(days=5),
            return_date=date.today() - timedelta(days=7),
            is_returned=True
        )

        # Rental 3: Overdue rental for Bob Smith (borrowed 25 days ago, due 11 days ago) -> "Sapiens"
        book_bob_overdue = books[3]
        rental3 = Rental.objects.create(
            user=bob_user,
            book=book_bob_overdue,
            due_date=date.today() - timedelta(days=11)
        )
        # Manually alter borrow_date using update after creation
        Rental.objects.filter(id=rental3.id).update(borrow_date=date.today() - timedelta(days=25))
        book_bob_overdue.is_available = False
        book_bob_overdue.save()

        self.stdout.write("Created test rentals (1 active, 1 returned, 1 overdue).")
        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
