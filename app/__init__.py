from flask import Flask
from flask_jwt_extended import JWTManager
from app.models.user import db
from app.config import config
from flask_migrate import Migrate

# Initialize extensions
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='default'):
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Register blueprints
    from app.auth import auth_bp
    app.register_blueprint(auth_bp)

    # Initialize database
    with app.app_context():
        db.create_all()

    return app
