from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app(config=None):
    """Application factory function"""
    app = Flask(__name__, instance_relative_config=True)

    # Load configuration
    app.config.from_object('config')

    # Ensure instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Initialize extensions with app
    db.init_app(app)

    # Configure JWT
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    jwt.init_app(app)

    with app.app_context():
        # Import and register blueprints
        from app.auth import auth_bp
        app.register_blueprint(auth_bp)

        # Initialize database
        db.create_all()

        @app.route('/')
        def index():
            return app.send_static_file('index.html')

    return app
