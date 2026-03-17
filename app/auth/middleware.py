from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt

def token_required(f):
    """Decorator to enforce JWT authentication on routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # Verify JWT is present and valid
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'error': 'unauthorized',
                'message': 'Authentication required'
            }), 401
    return decorated

def admin_required(f):
    """Decorator to enforce admin role authorization"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # Verify JWT is present and valid
            verify_jwt_in_request()

            # Get claims from JWT
            claims = get_jwt()

            # Check if user has admin role
            if claims.get('role') != 'admin':
                return jsonify({
                    'error': 'forbidden',
                    'message': 'Admin privileges required'
                }), 403

            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'error': 'unauthorized',
                'message': 'Authentication required'
            }), 401
    return decorated
