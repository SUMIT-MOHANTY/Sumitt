import re
from email_validator import validate_email, EmailNotValidError

def validate_registration_input(data):
    """Validate registration input data"""
    errors = []

    # Check if email is provided and valid
    if 'email' not in data or not data['email']:
        errors.append("Email is required")
    else:
        try:
            # Validate email format
            validate_email(data['email'])
        except EmailNotValidError:
            errors.append("Invalid email format")

    # Check if password is provided
    if 'password' not in data or not data['password']:
        errors.append("Password is required")
    else:
        # Validate password complexity
        password = data['password']
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        if not re.search(r'[0-9]', password):
            errors.append("Password must contain at least one number")

    # Check if confirm_password matches password
    if 'confirm_password' not in data or data['confirm_password'] != data.get('password', ''):
        errors.append("Passwords do not match")

    return errors
