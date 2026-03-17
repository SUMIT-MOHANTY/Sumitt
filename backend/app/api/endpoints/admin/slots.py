from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.db.session import get_db
from backend.app.models.slot import SlotCreate, Slot
from backend.app.services.slot_service import SlotService
from backend.app.api.dependencies import get_current_admin_user
from backend.app.exceptions import DuplicateResourceException

router = APIRouter()

@router.post("/", response_model=Slot, status_code=status.HTTP_201_CREATED)
def create_slot(
    slot_in: SlotCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Create a new appointment slot.

    Admin only endpoint that creates a new appointment slot at a location
    with specific date, time range and capacity.
    """
    try:
        slot = SlotService.create_slot(db=db, slot_in=slot_in)
        return slot
    except DuplicateResourceException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/", response_model=List[Slot])
def get_slots(
    skip: int = 0,
    limit: int = 100,
    location_id: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Get all appointment slots with optional filtering.

    Admin only endpoint that returns all appointment slots, with optional
    filtering by location.
    """
    slots = SlotService.get_slots(
        db=db,
        skip=skip,
        limit=limit,
        location_id=location_id
    )
    return slots
