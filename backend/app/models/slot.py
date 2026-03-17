from sqlalchemy import Column, Integer, Date, Time, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field, validator
from datetime import date, time, datetime
from typing import Optional

from backend.app.db.base import Base

class SlotModel(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    capacity = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationship to Location
    location = relationship("LocationModel", back_populates="slots")
    # Relationship to Bookings (if implemented)
    bookings = relationship("BookingModel", back_populates="slot", cascade="all, delete-orphan")

# Pydantic models for API validation
class SlotBase(BaseModel):
    location_id: int
    date: date
    start_time: time
    end_time: time
    capacity: int

    @validator('capacity')
    def capacity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Capacity must be a positive integer')
        return v

    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v

class SlotCreate(SlotBase):
    pass

class SlotUpdate(BaseModel):
    capacity: Optional[int] = None

    @validator('capacity')
    def capacity_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Capacity must be a positive integer')
        return v

class SlotInDBBase(SlotBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Slot(SlotInDBBase):
    pass

class SlotInDB(SlotInDBBase):
    pass
