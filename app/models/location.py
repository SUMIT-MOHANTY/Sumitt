"""Location model for the passport appointment booking system."""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.models.base import Base

class Location(Base):
    """Represents a physical location where passport appointments can be booked."""

    __tablename__ = "locations"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    capacity = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    slots = relationship("Slot", back_populates="location", cascade="all, delete-orphan")

    def __init__(self, name: str, address: str, capacity: int, is_active: bool = True) -> None:
        """Initialize a new Location.

        Args:
            name: The name of the location
            address: The physical address of the location
            capacity: Maximum number of simultaneous appointments
            is_active: Whether the location is currently active
        """
        self.name = name
        self.address = address
        self.capacity = capacity
        self.is_active = is_active

    def __repr__(self) -> str:
        """Return a string representation of the Location."""
        return f"<Location(id={self.id}, name='{self.name}', capacity={self.capacity})>"

    def to_dict(self) -> dict:
        """Convert Location object to a dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "capacity": self.capacity,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
