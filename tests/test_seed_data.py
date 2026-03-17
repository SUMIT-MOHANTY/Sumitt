"""Tests for the seed data script."""
import pytest
import os
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base, Location, Slot
from scripts.seed_data import create_locations, create_slots

@pytest.fixture
def session():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_create_locations(session):
    """Test creating sample locations."""
    locations = create_locations(session)

    # Check that 3 locations were created
    assert len(locations) == 3

    # Check that the locations have the correct data
    names = set(location.name for location in locations)
    assert "Downtown Passport Office" in names
    assert "Westside Government Center" in names
    assert "Eastside Municipal Building" in names

    # Query locations from database
    db_locations = session.query(Location).all()
    assert len(db_locations) == 3

def test_create_slots(session):
    """Test creating sample slots."""
    # Create locations first
    locations = create_locations(session)

    # Create slots for those locations
    create_slots(session, locations)

    # Check that slots were created for each location
    for location in locations:
        slots = session.query(Slot).filter_by(location_id=location.id).all()
        assert len(slots) > 0

    # Check that slots were created for the next 30 days
    today = date.today()
    for day_offset in range(30):
        slot_date = today + timedelta(days=day_offset)
        date_slots = session.query(Slot).filter_by(date=slot_date).all()
        assert len(date_slots) > 0

def test_slot_times(session):
    """Test that slots have correct times."""
    # Create locations and slots
    locations = create_locations(session)
    create_slots(session, locations)

    # Get all slots for the first location
    location = locations[0]
    slots = session.query(Slot).filter_by(location_id=location.id).all()

    # Check that there are morning and afternoon slots
    morning_slots = [slot for slot in slots if slot.start_time.hour == 9]
    afternoon_slots = [slot for slot in slots if slot.start_time.hour == 14]

    assert len(morning_slots) > 0
    assert len(afternoon_slots) > 0

def test_slot_max_bookings(session):
    """Test that slots have correct max_bookings values."""
    # Create locations and slots
    locations = create_locations(session)
    create_slots(session, locations)

    # Check that each location's slots have the correct max_bookings
    for location in locations:
        slots = session.query(Slot).filter_by(location_id=location.id).all()
        for slot in slots:
            assert slot.max_bookings == location.capacity // 2
