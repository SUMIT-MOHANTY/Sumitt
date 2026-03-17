from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    max_capacity = Column(Integer, nullable=False)
    booked_count = Column(Integer, default=0)

    # Relationship with Location
    location = relationship("Location", back_populates="slots")
    # Relationship with Booking
    bookings = relationship("Booking", back_populates="slot")

    @property
    def remaining_capacity(self):
        return self.max_capacity - self.booked_count
