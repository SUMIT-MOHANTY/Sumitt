"""Tests for the Location model."""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import datetime

from app.models import Base, Location

@pytest.fixture
def session():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_location_creation(session):
    """Test creating a new location."""
    # Create a test location
    location = Location(
        name="Test Location",
        address="123 Test Street, Test City",
        capacity=10
    )
    session.add(location)
    session.commit()

    # Query the location back
    retrieved = session.query(Location).filter_by(name="Test Location").first()

    # Check that the location was created correctly
    assert retrieved is not None
    assert retrieved.name == "Test Location"
    assert retrieved.address == "123 Test Street, Test City"
    assert retrieved.capacity == 10
    assert retrieved.is_active is True
    assert isinstance(retrieved.created_at, datetime.datetime)
    assert isinstance(retrieved.updated_at, datetime.datetime)

def test_location_to_dict(session):
    """Test the to_dict method."""
    location = Location(
        name="Downtown Office",
        address="100 Main St",
        capacity=15
    )
    session.add(location)
    session.commit()

    location_dict = location.to_dict()

    assert location_dict["id"] == location.id
    assert location_dict["name"] == "Downtown Office"
    assert location_dict["address"] == "100 Main St"
    assert location_dict["capacity"] == 15
    assert location_dict["is_active"] is True
    assert "created_at" in location_dict
    assert "updated_at" in location_dict

def test_location_update(session):
    """Test updating a location."""
    # Create and add a location
    location = Location(
        name="Old Name",
        address="Old Address",
        capacity=5
    )
    session.add(location)
    session.commit()

    # Update the location
    location.name = "New Name"
    location.capacity = 10
    old_updated_at = location.updated_at

    # Wait a moment to ensure updated_at will change
    import time
    time.sleep(0.1)

    session.commit()

    # Query the location back
    retrieved = session.query(Location).filter_by(id=location.id).first()

    # Check that the location was updated correctly
    assert retrieved.name == "New Name"
    assert retrieved.capacity == 10
    assert retrieved.updated_at > old_updated_at

def test_repr(session):
    """Test the __repr__ method."""
    location = Location(
        name="Test Location",
        address="123 Test St",
        capacity=20
    )
    session.add(location)
    session.commit()

    expected = f"<Location(id={location.id}, name='Test Location', capacity=20)>"
    assert repr(location) == expected
