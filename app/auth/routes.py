from flask import Blueprint, request, jsonify
from .services import AuthService
from .validation import validate_registration_input
from .models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()

    # Validate input data
    validation_errors = validate_registration_input(data)
    if validation_errors:
        return jsonify({
            'error': 'Validation failed',
            'details': validation_errors
        }), 400

    # Register user
    user, error = AuthService.register_user(
        email=data['email'],
        password=data['password']
    )

    if error:
        return jsonify({
            'error': 'Registration failed',
            'details': [error]
        }), 400

    # Generate token for the new user
    token = AuthService.generate_token(user)

    return jsonify({
        'user_id': user.id,
        'email': user.email,
        'token': token,
        'message': 'Registration successful'
    }), 201

# Add login and other auth endpoints here
