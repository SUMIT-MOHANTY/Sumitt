from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.schemas.booking import BookingCreate, Booking, BookingList, BookingError
from app.services.booking_service import BookingService

router = APIRouter(
    prefix="/api/bookings",
    tags=["bookings"]
)

@router.post("/", response_model=Booking, status_code=status.HTTP_201_CREATED,
             responses={
                 400: {"model": BookingError, "description": "Slot unavailable"},
                 409: {"model": BookingError, "description": "Duplicate booking"}
             })
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Create a new booking for a slot
    """
    return BookingService.create_booking(db=db, booking=booking, user_id=current_user["id"])

@router.get("/{booking_id}", response_model=Booking)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Retrieve a specific booking by ID
    """
    return BookingService.get_booking(db=db, booking_id=booking_id, user_id=current_user["id"])

@router.get("/user", response_model=BookingList)
def get_user_bookings(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Retrieve all bookings for the current user
    """
    bookings = BookingService.get_user_bookings(db=db, user_id=current_user["id"])
    return {"bookings": bookings}
