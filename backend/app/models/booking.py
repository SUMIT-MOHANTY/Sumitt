from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class BookingBase(BaseModel):
    user_id: int
    slot_id: int
    booking_date: datetime

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: int
    status: str = "confirmed"
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        orm_mode = True
