"""Appointment slot model for the passport appointment booking system."""
from datetime import datetime, date, time
from typing import Optional

from sqlalchemy import Column, Integer, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base

class Slot(Base):
    """Represents an appointment slot at a specific location and time."""

    __tablename__ = "slots"

    id = Column(Integer, primary_key=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    max_bookings = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    location = relationship("Location", back_populates="slots")
    bookings = relationship("Booking", back_populates="slot", cascade="all, delete-orphan")

    def __init__(
        self, location_id: int, date: date, start_time: time,
        end_time: time, max_bookings: int
    ) -> None:
        """Initialize a new Slot.

        Args:
            location_id: ID of the location for this slot
            date: Date of the appointment slot
            start_time: Start time of the slot
            end_time: End time of the slot
            max_bookings: Maximum number of bookings allowed for this slot
        """
        self.location_id = location_id
        self.date = date
        self.start_time = start_time
        self.end_time = end_time
        self.max_bookings = max_bookings

    def __repr__(self) -> str:
        """Return a string representation of the Slot."""
        return (
            f"<Slot(id={self.id}, location_id={self.location_id}, "
            f"date={self.date}, time={self.start_time}-{self.end_time})>"
        )

    @property
    def available_spots(self) -> int:
        """Calculate number of available booking spots."""
        used_spots = len(self.bookings)
        return max(0, self.max_bookings - used_spots)

    def is_available(self) -> bool:
        """Check if slot has available booking spots."""
        return self.available_spots > 0

    def to_dict(self) -> dict:
        """Convert Slot object to a dictionary."""
        return {
            "id": self.id,
            "location_id": self.location_id,
            "date": self.date.isoformat() if self.date else None,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "max_bookings": self.max_bookings,
            "available_spots": self.available_spots,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
