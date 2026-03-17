from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..models.booking import BookingCreate, Booking
from ..services.booking_service import BookingService
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["bookings"])
booking_service = BookingService()

@router.post("/", response_model=Booking, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user = Depends(get_current_user)
):
    """
    Create a new booking with automatic email confirmation
    """
    # Ensure the user can only book for themselves
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create bookings for yourself"
        )

    try:
        return booking_service.create_booking(db, booking, background_tasks)
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create booking: {str(e)}"
        )

@router.get("/user/{user_id}", response_model=List[Booking])
def get_user_bookings(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all bookings for a specific user
    Users can only view their own bookings unless they are an admin
    """
    # Check if user is requesting their own bookings or is an admin
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own bookings"
        )

    return booking_service.get_user_bookings(db, user_id)

@router.get("/{booking_id}", response_model=Booking)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get a booking by its ID
    Users can only view their own bookings unless they are an admin
    """
    booking = booking_service.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Check if user is requesting their own booking or is an admin
    if booking.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own bookings"
        )

    return booking

@router.delete("/{booking_id}", response_model=Booking)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Cancel a booking by changing its status to 'cancelled'
    Users can only cancel their own bookings unless they are an admin
    """
    # First check if the booking exists
    booking = booking_service.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Check if user is cancelling their own booking or is an admin
    if booking.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own bookings"
        )

    return booking_service.cancel_booking(db, booking_id)
