from pydantic import BaseSettings
from typing import Optional, Dict, Any

class Settings(BaseSettings):
    PROJECT_NAME: str = "Passport Appointment System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "your-secret-key-here"

    # Database settings
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/passport_app"

    # JWT Settings
    JWT_SECRET: str = "your-jwt-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Email Settings
    EMAILS_ENABLED: bool = True
    EMAIL_BACKEND: str = "SMTP"  # Options: SMTP, CONSOLE
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = 587
    SMTP_HOST: Optional[str] = "smtp.gmail.com"
    SMTP_USER: Optional[str] = "your-email@gmail.com"
    SMTP_PASSWORD: Optional[str] = "your-email-password"
    EMAIL_FROM: str = "noreply@passportappt.com"
    EMAIL_FROM_NAME: str = "Passport Appointment System"
    EMAIL_TEMPLATES_DIR: str = "app/templates"
    EMAIL_TEST_USER: str = "test@example.com"

    # For testing and development
    TEST_MODE: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
