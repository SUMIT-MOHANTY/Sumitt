from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

# Slot schema for creating a new slot
class SlotCreate(BaseModel):
    location_id: int
    start_time: datetime
    end_time: datetime
    max_capacity: int

# Slot schema for updating an existing slot
class SlotUpdate(BaseModel):
    location_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    max_capacity: Optional[int] = None
    booked_count: Optional[int] = None

# Slot schema for responses
class SlotInDB(BaseModel):
    id: int
    location_id: int
    start_time: datetime
    end_time: datetime
    max_capacity: int
    booked_count: int

    class Config:
        orm_mode = True

# Slot schema for search response that includes location name and remaining capacity
class SlotSearch(BaseModel):
    id: int
    location_id: int
    location_name: str
    start_time: datetime
    end_time: datetime
    max_capacity: int
    booked_count: int
    remaining_capacity: int

    class Config:
        orm_mode = True

# Schema for slot search response
class SlotSearchResponse(BaseModel):
    slots: List[SlotSearch]
