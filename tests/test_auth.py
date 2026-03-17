import json
import pytest
from app import create_app
from app.models.user import db, User

@pytest.fixture
def app():
    """Create and configure a Flask app for testing."""
    app = create_app('testing')

    # Create test database and tables
    with app.app_context():
        db.create_all()

    yield app

    # Clean up / reset resources
    with app.app_context():
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test CLI runner for the app."""
    return app.test_cli_runner()

def test_register_user(client):
    """Test user registration endpoint."""
    # Test successful registration
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'email': 'test@example.com',
            'password': 'password123',
            'confirm_password': 'password123'
        }),
        content_type='application/json'
    )

    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'user_id' in data
    assert 'token' in data
    assert data['email'] == 'test@example.com'

    # Test registration with existing email
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'email': 'test@example.com',
            'password': 'password123',
            'confirm_password': 'password123'
        }),
        content_type='application/json'
    )

    assert response.status_code == 409

    # Test registration with mismatched passwords
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'email': 'another@example.com',
            'password': 'password123',
            'confirm_password': 'password456'
        }),
        content_type='application/json'
    )

    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'details' in data
    assert any('match' in detail.lower() for detail in data['details'])

def test_login_user(client):
    """Test user login endpoint."""
    # Create a test user
    client.post(
        '/api/auth/register',
        data=json.dumps({
            'email': 'login@example.com',
            'password': 'password123',
            'confirm_password': 'password123'
        }),
        content_type='application/json'
    )

    # Test successful login
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': 'login@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )

    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'token' in data
    assert 'user_id' in data

    # Test login with invalid password
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': 'login@example.com',
            'password': 'wrongpassword'
        }),
        content_type='application/json'
    )

    assert response.status_code == 401

    # Test login with non-existent user
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': 'nonexistent@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )

    assert response.status_code == 401

def test_user_profile(client):
    """Test getting user profile with authentication."""
    # Register a user and get token
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'email': 'profile@example.com',
            'password': 'password123',
            'confirm_password': 'password123'
        }),
        content_type='application/json'
    )

    token = json.loads(response.data)['token']

    # Test accessing profile with valid token
    response = client.get(
        '/api/auth/profile',
        headers={'Authorization': f'Bearer {token}'}
    )

    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['email'] == 'profile@example.com'

    # Test accessing profile without token
    response = client.get('/api/auth/profile')
    assert response.status_code == 401
