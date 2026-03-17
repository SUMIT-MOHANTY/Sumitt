from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from ..models.booking import BookingCreate
from ..db.models import Booking as BookingModel, User, Slot

class BookingRepository:
    def create_booking(self, db: Session, booking: BookingCreate) -> BookingModel:
        """
        Create a new booking in the database
        Raises IntegrityError if a duplicate booking is detected
        """
        # Check if user exists
        user = db.query(User).filter(User.id == booking.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if slot exists
        slot = db.query(Slot).filter(Slot.id == booking.slot_id).first()
        if not slot:
            raise HTTPException(status_code=404, detail="Slot not found")

        # Check if slot is in the future
        if booking.booking_date < datetime.now():
            raise HTTPException(status_code=400, detail="Cannot book a slot in the past")

        # Create new booking
        try:
            db_booking = BookingModel(
                user_id=booking.user_id,
                slot_id=booking.slot_id,
                booking_date=booking.booking_date,
                status="confirmed"
            )
            db.add(db_booking)
            db.commit()
            db.refresh(db_booking)
            return db_booking
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Duplicate booking: You already have a booking for this slot"
            )

    def get_user_bookings(self, db: Session, user_id: int) -> List[BookingModel]:
        """Get all bookings for a specific user"""
        return db.query(BookingModel).filter(BookingModel.user_id == user_id).all()

    def get_booking_by_id(self, db: Session, booking_id: int) -> Optional[BookingModel]:
        """Get a booking by its ID"""
        return db.query(BookingModel).filter(BookingModel.id == booking_id).first()

    def cancel_booking(self, db: Session, booking_id: int) -> Optional[BookingModel]:
        """Cancel a booking by changing its status"""
        booking = self.get_booking_by_id(db, booking_id)
        if booking:
            booking.status = "cancelled"
            db.commit()
            db.refresh(booking)
        return booking
