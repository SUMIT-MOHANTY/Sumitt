from flask_jwt_extended import create_access_token
from datetime import timedelta

def generate_token(user):
    """
    Generate a JWT token for the user

    Args:
        user: User object containing user information

    Returns:
        str: JWT token
    """
    # Create token with user ID as identity and role as additional claim
    token = create_access_token(
        identity=user.id,
        additional_claims={'role': user.role},
        expires_delta=timedelta(hours=24)
    )
    return token
