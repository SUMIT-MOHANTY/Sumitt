import jwt
import datetime
from flask import current_app
from .models import User, db

class AuthService:
    """Service class for handling authentication operations"""

    @staticmethod
    def register_user(email, password):
        """Register a new user"""
        # Convert email to lowercase to ensure uniqueness
        email = email.lower()

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return None, "Email already registered"

        # Create new user
        new_user = User(email=email, password=password)
        db.session.add(new_user)

        try:
            db.session.commit()
            return new_user, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def generate_token(user):
        """Generate JWT token for authenticated user"""
        payload = {
            'user_id': user.id,
            'email': user.email,
            'role': 'admin' if user.is_admin else 'user',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }

        # Create JWT token
        token = jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        return token
