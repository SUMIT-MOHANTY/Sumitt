from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    slot_id = Column(Integer, ForeignKey("slots.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String, default="booked", nullable=False)

    # Relationships
    slot = relationship("Slot", back_populates="bookings")
    user = relationship("User", back_populates="bookings")

    # Unique constraint to prevent duplicate bookings
    __table_args__ = (
        UniqueConstraint('slot_id', 'user_id', name='uq_user_slot'),
    )
