import os

# Database configuration
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///passport_appointments.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')

# Application configuration
DEBUG = os.environ.get('FLASK_ENV') == 'development'
