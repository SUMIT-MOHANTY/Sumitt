from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from dateutil.parser import parse
from dateutil.parser._parser import ParserError

from app.api import deps
from app.models.slot import Slot
from app.models.location import Location
from app.schemas.slot import SlotSearch, SlotSearchResponse

router = APIRouter()

@router.get("/search", response_model=SlotSearchResponse)
def search_slots(
    location_id: Optional[int] = Query(None, description="Filter by location ID"),
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    db: Session = Depends(deps.get_db)
):
    """
    Search for available slots filtered by location and/or date.
    Only returns slots with remaining capacity > 0.
    """
    # Validate date format if provided
    parsed_date = None
    if date:
        try:
            parsed_date = parse(date).date()
        except ParserError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use YYYY-MM-DD."
            )

    # Build query
    query = (
        db.query(
            Slot.id,
            Slot.location_id,
            Location.name.label("location_name"),
            Slot.start_time,
            Slot.end_time,
            Slot.max_capacity,
            Slot.booked_count,
            (Slot.max_capacity - Slot.booked_count).label("remaining_capacity")
        )
        .join(Location)  # Join with Location to get location name
        .filter(Slot.max_capacity > Slot.booked_count)  # Only slots with remaining capacity
    )

    # Apply filters if provided
    if location_id:
        # Check if location exists
        location = db.query(Location).filter(Location.id == location_id).first()
        if not location:
            raise HTTPException(
                status_code=404,
                detail=f"Location with ID {location_id} not found"
            )
        query = query.filter(Slot.location_id == location_id)

    if parsed_date:
        # Filter by date part of start_time
        query = query.filter(func.date(Slot.start_time) == parsed_date)

    # Execute query and create result objects
    slots_data = query.all()

    # Convert SQLAlchemy result to dictionary objects
    slots = []
    for slot in slots_data:
        slot_dict = {
            "id": slot.id,
            "location_id": slot.location_id,
            "location_name": slot.location_name,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "max_capacity": slot.max_capacity,
            "booked_count": slot.booked_count,
            "remaining_capacity": slot.remaining_capacity
        }
        slots.append(SlotSearch(**slot_dict))

    return SlotSearchResponse(slots=slots)
