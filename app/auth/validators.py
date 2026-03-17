from email_validator import validate_email, EmailNotValidError

def validate_registration_data(data):
    """Validate user registration data"""
    errors = []

    # Check if email is present
    if 'email' not in data or not data['email']:
        errors.append("Email is required")
    else:
        # Validate email format
        try:
            valid = validate_email(data['email'])
            # Update with normalized form
            data['email'] = valid.email
        except EmailNotValidError as e:
            errors.append(f"Invalid email format: {str(e)}")

    # Check if password is present
    if 'password' not in data or not data['password']:
        errors.append("Password is required")
    elif len(data['password']) < 8:
        errors.append("Password must be at least 8 characters long")

    # Check if confirm_password is present and matches
    if 'confirm_password' not in data or not data['confirm_password']:
        errors.append("Password confirmation is required")
    elif data.get('password') != data.get('confirm_password'):
        errors.append("Passwords do not match")

    return errors

def validate_login_data(data):
    """Validate user login data"""
    errors = []

    # Check if email is present
    if 'email' not in data or not data['email']:
        errors.append("Email is required")
    else:
        # Validate email format
        try:
            validate_email(data['email'])
        except EmailNotValidError as e:
            errors.append(f"Invalid email format: {str(e)}")

    # Check if password is present
    if 'password' not in data or not data['password']:
        errors.append("Password is required")

    return errors
