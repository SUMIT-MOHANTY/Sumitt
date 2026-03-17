from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, BackgroundTasks

from sqlalchemy.orm import Session

from ..models.booking import BookingCreate, Booking
from ..repositories.booking_repository import BookingRepository
from ..services.email_service import EmailService
from ..db.models import User, Slot

class BookingService:
    def __init__(self):
        self.repository = BookingRepository()
        self.email_service = EmailService()

    def create_booking(
        self, db: Session, booking_data: BookingCreate, background_tasks: BackgroundTasks
    ) -> Booking:
        """
        Create a new booking with duplicate prevention,
        and send a confirmation email in the background
        """
        # Create the booking in the database
        db_booking = self.repository.create_booking(db, booking_data)

        # Fetch additional data needed for email
        user = db.query(User).filter(User.id == booking_data.user_id).first()
        slot = db.query(Slot).filter(Slot.id == booking_data.slot_id).first()

        if user and slot:
            # Prepare data for email
            email_data = {
                "id": db_booking.id,
                "user_name": f"{user.first_name} {user.last_name}",
                "date": db_booking.booking_date.strftime("%A, %B %d, %Y"),
                "time": db_booking.booking_date.strftime("%I:%M %p"),
                "location": slot.location.name if hasattr(slot, 'location') else "N/A"
            }

            # Send confirmation email asynchronously
            self.email_service.send_booking_confirmation_async(
                background_tasks, user.email, email_data
            )

        # Convert DB model to Pydantic model for response
        return Booking.from_orm(db_booking)

    def get_user_bookings(self, db: Session, user_id: int) -> List[Booking]:
        """Get all bookings for a specific user"""
        db_bookings = self.repository.get_user_bookings(db, user_id)
        return [Booking.from_orm(booking) for booking in db_bookings]

    def get_booking_by_id(self, db: Session, booking_id: int) -> Optional[Booking]:
        """Get a booking by its ID"""
        db_booking = self.repository.get_booking_by_id(db, booking_id)
        if not db_booking:
            return None
        return Booking.from_orm(db_booking)

    def cancel_booking(self, db: Session, booking_id: int) -> Optional[Booking]:
        """Cancel a booking"""
        db_booking = self.repository.cancel_booking(db, booking_id)
        if not db_booking:
            return None
        return Booking.from_orm(db_booking)
