from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Book, Rental
import re

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name')

    class Model:
        model = User
        fields = ['id', 'name', 'email', 'role']

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role']


class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'confirm_password', 'role']
        extra_kwargs = {
            'email': {'required': True},
            'role': {'required': True}
        }

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        
        # Email format check
        email_regex = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
        if not re.match(email_regex, value):
            raise serializers.ValidationError("Enter a valid email address.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        # Remove confirm_password as it's not a model field
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        # Extract name (mapped to first_name in Meta)
        first_name = validated_data.pop('first_name')
        
        user = User.objects.create_user(
            email=validated_data['email'].lower(),
            password=password,
            first_name=first_name,
            role=validated_data.get('role', 'USER')
        )
        return user


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'genre', 'description', 'image_url', 'is_available']

    def validate_title(self, value):
        # Exclude current instance in case of update
        instance = self.instance
        queryset = Book.objects.filter(title__iexact=value)
        if instance:
            queryset = queryset.exclude(id=instance.id)
        if queryset.exists():
            raise serializers.ValidationError("A book with this title already exists.")
        return value


class RentalSerializer(serializers.ModelSerializer):
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Rental
        fields = ['id', 'user', 'book', 'borrow_date', 'due_date', 'return_date', 'is_returned', 'is_overdue']
        read_only_fields = ['user', 'borrow_date', 'due_date', 'return_date', 'is_returned', 'is_overdue']


class RentalDetailedSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    book = BookSerializer(read_only=True)
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Rental
        fields = ['id', 'user', 'book', 'borrow_date', 'due_date', 'return_date', 'is_returned', 'is_overdue']
