# Athena Library Management System

Athena is a production-ready, highly responsive, and premium web application designed to manage library assets, track member rentals, handle user registrations, and alert administrative staff to overdue loans.

## Technology Stack

- **Frontend**: React (Vite-based) + Tailwind CSS v4 + Lucide Icons + React Router DOM + Axios
- **Backend**: Django + Django REST Framework + Simple JWT (JSON Web Tokens)
- **Database**: SQLite (preconfigured)
- **Authentication**: JWT token-based authentication (Bearer schema) with secure local state handling

---

## Key Features

1. **Role-Based Protection**: Strict separation of User and Admin roles on both frontend routes and backend APIs.
2. **Dashboard Summary & Overdue Alerting**:
   - Standard user: Tracks current loans and shows remaining days before overdue status is reached.
   - Admin user: Tracks system statistics (books count, users, active rentals) and displays a list of urgent overdue rentals in bright red warning flags with borrower details.
3. **Inventory Management (CRUD)**:
   - Administrators can add, edit, and delete books through a modern slide-over glassmorphic drawer modal.
   - Restricts deleting books that are currently checked out.
4. **Catalogue & Search**:
   - Library members can search books by title or author and borrow copies immediately.
5. **Robust Validation**:
   - Front-end input matching (emails, matching passwords, 8+ character password length).
   - Back-end strict validation constraints (non-duplicate book titles, email uniqueness, ownership checks on returns).
6. **Polished Micro-Animations**: Smooth transitions, active button loading state triggers, loading skeleton screens, and clean navigation menus.

---

## Initial Credentials (Seeded)

For testing and verification, the database has been pre-seeded with the following accounts:

### 1. Administrative Staff Account
- **Email**: `admin@library.com`
- **Password**: `password123`
- **Use Case**: Access Admin Dashboard (stats, red overdue warnings list), Manage Books CRUD, inspect All Rentals directory, and browse registered user details.

### 2. Standard Member Account (Jane Doe)
- **Email**: `user1@library.com`
- **Password**: `password123`
- **Use Case**: Access User Dashboard showing an **active book loan** ("Clean Code") with days remaining, browse and search the Catalogue, borrow books, and view a completed past borrowing history ("Refactoring" returned in the past).

### 3. Overdue Member Account (Bob Smith)
- **Email**: `user2@library.com`
- **Password**: `password123`
- **Use Case**: Log in to see a book loan ("The Pragmatic Programmer") that has **expired / is overdue** and highlighted in Coral warning banners. (Admins will see Bob listed on their red overdue list).

---

## Setup & Running Guide

Ensure you have **Python 3.10+** and **Node.js 18+** installed.

### 1. Backend Server Setup (Django)

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run database migrations:
   ```bash
   python manage.py migrate
   ```
4. Seed the database with mock data:
   ```bash
   python manage.py seed_db
   ```
5. Start the development server (runs on `http://127.0.0.1:8000/`):
   ```bash
   python manage.py runserver
   ```

### 2. Frontend Client Setup (Vite React)

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the dev server (runs on `http://localhost:5173/` or similar):
   ```bash
   npm run dev
   ```

---

## Verification & Testing

### Running Backend Unit Tests
To run the automated suite of 13 comprehensive backend integration tests, navigate to the `backend/` directory and execute:
```bash
python manage.py test
```
The test suite validates:
- Standard user registration and validation triggers.
- Wrong credentials and JWT token authentication.
- Admin dashboard route blockades from standard users.
- Unique book title validation.
- Double-borrowing and double-returning edge cases.
