import os
from datetime import timedelta

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 'postgresql://postgres:postgres@db:5432/passport_booking'
    )

    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_COOKIE_SECURE = os.environ.get('JWT_COOKIE_SECURE', 'False').lower() == 'true'
    JWT_TOKEN_LOCATION = ['headers']

    # Authentication rate limiting
    AUTH_RATE_LIMIT = 5  # Number of failed attempts
    AUTH_RATE_LIMIT_TIMEOUT = 300  # Timeout in seconds (5 minutes)

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    JWT_COOKIE_SECURE = False

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_COOKIE_SECURE = False

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    JWT_COOKIE_SECURE = True

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
