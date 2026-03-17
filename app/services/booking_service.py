from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.schemas.booking import BookingCreate
from app.models.slot import Slot

class BookingService:
    @staticmethod
    def create_booking(db: Session, booking: BookingCreate, user_id: int) -> Booking:
        """
        Create a new booking for a user

        Args:
            db: Database session
            booking: BookingCreate schema with slot_id
            user_id: ID of the user making the booking

        Returns:
            The created booking

        Raises:
            HTTPException: If slot doesn't exist, is already fully booked,
                          or if user already has a booking for this slot
        """
        # Override user_id from token
        booking_data = booking.dict()
        booking_data["user_id"] = user_id

        # Check if slot exists and is available
        slot = db.query(Slot).filter(Slot.id == booking_data["slot_id"]).first()
        if not slot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Slot not found"
            )

        # Get current bookings count for the slot
        current_bookings = db.query(Booking).filter(
            Booking.slot_id == booking_data["slot_id"],
            Booking.status == "booked"
        ).count()

        # Check if slot is fully booked
        if current_bookings >= slot.capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slot is already fully booked"
            )

        # Create new booking
        db_booking = Booking(**booking_data)

        try:
            db.add(db_booking)
            db.commit()
            db.refresh(db_booking)
            return db_booking
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already booked this slot"
            )

    @staticmethod
    def get_booking(db: Session, booking_id: int, user_id: int) -> Booking:
        """
        Get a specific booking by ID

        Args:
            db: Database session
            booking_id: ID of the booking to retrieve
            user_id: ID of the user (for authorization)

        Returns:
            The requested booking

        Raises:
            HTTPException: If booking doesn't exist or doesn't belong to user
        """
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )

        # Check if booking belongs to user (unless admin)
        if booking.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this booking"
            )

        return booking

    @staticmethod
    def get_user_bookings(db: Session, user_id: int):
        """
        Get all bookings for a user

        Args:
            db: Database session
            user_id: ID of the user

        Returns:
            List of user's bookings
        """
        bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
        return bookings
