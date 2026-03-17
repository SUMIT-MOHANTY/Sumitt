from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class User(db.Model):
    """User model for authentication and user management."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)  # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, email, password, role='user'):
        """Initialize a new User with email and hashed password."""
        self.email = email
        self.password_hash = self.hash_password(password)
        self.role = role

    def hash_password(self, password):
        """Hash a password using bcrypt."""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

    def check_password(self, password):
        """Check if the provided password matches the stored hash."""
        password_bytes = password.encode('utf-8')
        hash_bytes = self.password_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)

    def is_admin(self):
        """Check if the user has admin role."""
        return self.role == 'admin'

    def to_dict(self):
        """Convert user object to dictionary for API responses."""
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
