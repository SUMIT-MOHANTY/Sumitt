"""Tests for the Slot model."""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import datetime

from app.models import Base, Location, Slot

@pytest.fixture
def session():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Add test location
    test_location = Location(
        name="Test Location",
        address="123 Test Street",
        capacity=20
    )
    session.add(test_location)
    session.commit()

    yield session
    session.close()

def test_slot_creation(session):
    """Test creating a new slot."""
    # Get the test location
    location = session.query(Location).first()

    # Create a test slot
    slot = Slot(
        location_id=location.id,
        date=datetime.date.today(),
        start_time=datetime.time(9, 0),
        end_time=datetime.time(10, 0),
        max_bookings=10
    )
    session.add(slot)
    session.commit()

    # Query the slot back
    retrieved = session.query(Slot).filter_by(location_id=location.id).first()

    # Check that the slot was created correctly
    assert retrieved is not None
    assert retrieved.location_id == location.id
    assert retrieved.date == datetime.date.today()
    assert retrieved.start_time == datetime.time(9, 0)
    assert retrieved.end_time == datetime.time(10, 0)
    assert retrieved.max_bookings == 10
    assert isinstance(retrieved.created_at, datetime.datetime)
    assert isinstance(retrieved.updated_at, datetime.datetime)

def test_slot_relationship(session):
    """Test the relationship between Location and Slot."""
    location = session.query(Location).first()

    # Create slots for the location
    slot1 = Slot(
        location_id=location.id,
        date=datetime.date.today(),
        start_time=datetime.time(9, 0),
        end_time=datetime.time(10, 0),
        max_bookings=5
    )

    slot2 = Slot(
        location_id=location.id,
        date=datetime.date.today(),
        start_time=datetime.time(11, 0),
        end_time=datetime.time(12, 0),
        max_bookings=5
    )

    session.add_all([slot1, slot2])
    session.commit()

    # Check that the location has the correct slots
    location = session.query(Location).first()
    assert len(location.slots) == 2
    assert location.slots[0].start_time == datetime.time(9, 0)
    assert location.slots[1].start_time == datetime.time(11, 0)

    # Check that the slots have the correct location
    slot = session.query(Slot).first()
    assert slot.location.name == "Test Location"

def test_available_spots(session):
    """Test the available_spots property."""
    location = session.query(Location).first()

    # Create a slot
    slot = Slot(
        location_id=location.id,
        date=datetime.date.today(),
        start_time=datetime.time(9, 0),
        end_time=datetime.time(10, 0),
        max_bookings=5
    )
    session.add(slot)
    session.commit()

    # Since we don't have Booking model yet for this test, we'll mock the bookings
    # by setting a bookings attribute directly
    slot.bookings = []
    assert slot.available_spots == 5
    assert slot.is_available() is True

    # Mock 3 bookings
    slot.bookings = [1, 2, 3]  # Just need the length to be 3
    assert slot.available_spots == 2
    assert slot.is_available() is True

    # Mock all spots taken
    slot.bookings = [1, 2, 3, 4, 5]
    assert slot.available_spots == 0
    assert slot.is_available() is False

    # Mock overbooking (shouldn't happen in real app)
    slot.bookings = [1, 2, 3, 4, 5, 6]
    assert slot.available_spots == 0
    assert slot.is_available() is False

def test_slot_to_dict(session):
    """Test the to_dict method."""
    location = session.query(Location).first()
    today = datetime.date.today()

    slot = Slot(
        location_id=location.id,
        date=today,
        start_time=datetime.time(14, 0),
        end_time=datetime.time(15, 0),
        max_bookings=8
    )
    session.add(slot)
    session.commit()

    slot_dict = slot.to_dict()

    assert slot_dict["id"] == slot.id
    assert slot_dict["location_id"] == location.id
    assert slot_dict["date"] == today.isoformat()
    assert slot_dict["start_time"] == "14:00:00"
    assert slot_dict["end_time"] == "15:00:00"
    assert slot_dict["max_bookings"] == 8
    assert slot_dict["available_spots"] == 8
    assert "created_at" in slot_dict
    assert "updated_at" in slot_dict

def test_repr(session):
    """Test the __repr__ method."""
    location = session.query(Location).first()
    today = datetime.date.today()

    slot = Slot(
        location_id=location.id,
        date=today,
        start_time=datetime.time(9, 0),
        end_time=datetime.time(10, 0),
        max_bookings=10
    )
    session.add(slot)
    session.commit()

    expected = f"<Slot(id={slot.id}, location_id={location.id}, date={today}, time=09:00:00-10:00:00)>"
    assert repr(slot) == expected
