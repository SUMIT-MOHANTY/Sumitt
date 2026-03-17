from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, validator

# Schema for creating a booking
class BookingCreate(BaseModel):
    slot_id: int
    user_id: Optional[int] = None

# Schema for returning a booking
class Booking(BaseModel):
    id: int
    slot_id: int
    user_id: int
    booking_time: datetime
    status: str

    class Config:
        orm_mode = True

# Schema for listing user bookings
class BookingList(BaseModel):
    bookings: List[Booking]

# Schema for error responses
class BookingError(BaseModel):
    error: str
    details: str
