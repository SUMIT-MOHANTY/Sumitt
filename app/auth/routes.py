from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from app.models.user import User, db
from app.auth.utils import generate_token

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint

    Expects:
        - email: string
        - password: string

    Returns:
        - On success: User info and JWT token
        - On failure: Error message with appropriate status code
    """
    try:
        # Get credentials from request
        data = request.get_json()

        # Validate request data
        if not data:
            return jsonify({
                'error': 'invalid_request',
                'message': 'Missing request data'
            }), 400

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({
                'error': 'invalid_credentials',
                'message': 'Email and password are required'
            }), 400

        # Find user by email
        user = User.query.filter_by(email=email).first()

        # Check if user exists and password is correct
        if not user or not user.verify_password(password):
            return jsonify({
                'error': 'invalid_credentials',
                'message': 'Invalid email or password'
            }), 401

        # Generate token
        token = generate_token(user)

        # Return user info and token
        return jsonify({
            'token': token,
            'user_id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role
        }), 200

    except Exception as e:
        return jsonify({
            'error': 'server_error',
            'message': str(e)
        }), 500
