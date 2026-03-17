from flask import request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.auth import auth_bp
from app.auth.validators import validate_registration_data, validate_login_data
from app.auth.utils import generate_token
from app.models.user import User, db

@auth_bp.route('/register', methods=['POST'])
def register_user():
    """
    Register a new user.

    Request body should contain:
    - email: string
    - password: string
    - confirm_password: string

    Returns:
    - 201: User successfully created with token
    - 400: Validation error
    - 409: Email already registered
    """
    data = request.get_json()

    # Validate input data
    errors = validate_registration_data(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 409

    # Create new user
    try:
        user = User(
            email=data['email'],
            password=data['password']
        )

        db.session.add(user)
        db.session.commit()

        # Generate token
        token = generate_token(user.id, user.role)

        return jsonify({
            'user_id': user.id,
            'email': user.email,
            'token': token,
            'message': 'Registration successful'
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login_user():
    """
    Authenticate a user.

    Request body should contain:
    - email: string
    - password: string

    Returns:
    - 200: Authentication successful with token
    - 400: Validation error
    - 401: Invalid credentials
    """
    data = request.get_json()

    # Validate input data
    errors = validate_login_data(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400

    # Find user by email
    user = User.query.filter_by(email=data['email']).first()

    # Verify user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Generate token
    token = generate_token(user.id, user.role)

    return jsonify({
        'user_id': user.id,
        'email': user.email,
        'token': token,
        'role': user.role
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get the current user's profile.

    Requires authentication.

    Returns:
    - 200: User profile data
    - 401: Not authenticated
    """
    identity = get_jwt_identity()
    user_id = identity.get('user_id')

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user.to_dict()), 200
