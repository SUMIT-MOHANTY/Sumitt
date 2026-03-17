from flask_jwt_extended import create_access_token
from datetime import timedelta
import os

def generate_token(user_id, role):
    """
    Generate a JWT token for the user.

    Args:
        user_id: User identifier
        role: User role for RBAC

    Returns:
        JWT token string
    """
    # Create token identity with user ID and role for RBAC
    token_identity = {'user_id': user_id, 'role': role}

    # Default expiration: 24 hours
    token_expiry = timedelta(hours=24)

    # Create token with identity and claims
    token = create_access_token(
        identity=token_identity,
        expires_delta=token_expiry,
        additional_claims={'role': role}
    )

    return token

def is_admin(jwt_data):
    """
    Check if the current JWT token belongs to an admin.

    Args:
        jwt_data: The JWT data payload

    Returns:
        Boolean indicating if user is admin
    """
    identity = jwt_data.get('identity', {})

    if isinstance(identity, dict):
        return identity.get('role') == 'admin'

    return False
