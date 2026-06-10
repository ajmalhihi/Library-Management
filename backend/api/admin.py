from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Book, Rental

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('first_name', 'email')
    ordering = ('email',)

class BookAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'author', 'genre', 'is_available')
    list_filter = ('genre', 'is_available')
    search_fields = ('title', 'author', 'genre')
    ordering = ('title',)

class RentalAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_email', 'book_title', 'borrow_date', 'due_date', 'return_date', 'is_returned', 'is_overdue')
    list_filter = ('is_returned', 'borrow_date', 'due_date')
    search_fields = ('user__email', 'user__first_name', 'book__title', 'book__author')
    ordering = ('-borrow_date',)

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'

    def book_title(self, obj):
        return obj.book.title
    book_title.short_description = 'Book Title'

admin.site.register(User, UserAdmin)
admin.site.register(Book, BookAdmin)
admin.site.register(Rental, RentalAdmin)
