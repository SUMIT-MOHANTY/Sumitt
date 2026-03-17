from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import date, time

from backend.app.models.slot import SlotModel, SlotCreate, Slot, SlotUpdate
from backend.app.exceptions import DuplicateResourceException, ResourceNotFoundException

class SlotService:
    @staticmethod
    def create_slot(db: Session, slot_in: SlotCreate) -> SlotModel:
        """Create a new appointment slot"""
        # Check for duplicate slots (same location, date, and overlapping time)
        duplicate = db.query(SlotModel).filter(
            and_(
                SlotModel.location_id == slot_in.location_id,
                SlotModel.date == slot_in.date,
                # Check for time overlap
                ((SlotModel.start_time <= slot_in.start_time) & (SlotModel.end_time > slot_in.start_time)) |
                ((SlotModel.start_time < slot_in.end_time) & (SlotModel.end_time >= slot_in.end_time)) |
                ((SlotModel.start_time >= slot_in.start_time) & (SlotModel.end_time <= slot_in.end_time))
            )
        ).first()

        if duplicate:
            raise DuplicateResourceException(
                f"A slot with overlapping time already exists at this location and date"
            )

        slot = SlotModel(
            location_id=slot_in.location_id,
            date=slot_in.date,
            start_time=slot_in.start_time,
            end_time=slot_in.end_time,
            capacity=slot_in.capacity
        )
        db.add(slot)
        db.commit()
        db.refresh(slot)
        return slot

    @staticmethod
    def get_slots(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        location_id: Optional[int] = None,
        slot_date: Optional[date] = None
    ) -> List[SlotModel]:
        """Get slots with optional filtering by location and date"""
        query = db.query(SlotModel)

        if location_id:
            query = query.filter(SlotModel.location_id == location_id)

        if slot_date:
            query = query.filter(SlotModel.date == slot_date)

        return query.order_by(SlotModel.date, SlotModel.start_time).offset(skip).limit(limit).all()

    @staticmethod
    def get_slot(db: Session, slot_id: int) -> SlotModel:
        """Get a specific slot by ID"""
        slot = db.query(SlotModel).filter(SlotModel.id == slot_id).first()
        if not slot:
            raise ResourceNotFoundException(f"Slot with id {slot_id} not found")
        return slot

    @staticmethod
    def update_slot(db: Session, slot_id: int, slot_in: SlotUpdate) -> SlotModel:
        """Update a slot's information"""
        slot = SlotService.get_slot(db, slot_id)

        # Update fields
        if slot_in.capacity is not None:
            slot.capacity = slot_in.capacity

        db.commit()
        db.refresh(slot)
        return slot

    @staticmethod
    def delete_slot(db: Session, slot_id: int) -> None:
        """Delete a slot"""
        slot = SlotService.get_slot(db, slot_id)
        db.delete(slot)
        db.commit()
