import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.main import app
from app.models.booking import Booking
from app.models.slot import Slot
from app.models.user import User

# Setup test client
client = TestClient(app)

def create_test_user(db: Session):
    """Create a test user for booking"""
    user = User(
        email="testuser@example.com",
        hashed_password="hashed_password",
        first_name="Test",
        last_name="User",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_test_slot(db: Session, location_id: int = 1):
    """Create a test slot for booking"""
    tomorrow = datetime.now() + timedelta(days=1)
    slot = Slot(
        location_id=location_id,
        date=tomorrow.date(),
        time=tomorrow.time(),
        duration_minutes=30,
        capacity=5
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot

@pytest.fixture
def test_data(db: Session):
    """Create test data for bookings"""
    # Create test user
    user = create_test_user(db)

    # Create test slot
    slot = create_test_slot(db)

    # Return test data
    return {
        "user": user,
        "slot": slot,
    }

def test_create_booking_success(db: Session, test_data, mocker):
    """Test successful booking creation"""
    # Mock authentication
    mocker.patch(
        "app.dependencies.get_current_user",
        return_value={"id": test_data["user"].id, "email": test_data["user"].email}
    )

    # Create booking
    response = client.post(
        "/api/bookings/",
        json={"slot_id": test_data["slot"].id}
    )

    # Assert response
    assert response.status_code == 201
    data = response.json()
    assert data["slot_id"] == test_data["slot"].id
    assert data["user_id"] == test_data["user"].id
    assert data["status"] == "booked"

    # Verify booking in database
    booking = db.query(Booking).filter(Booking.id == data["id"]).first()
    assert booking is not None

def test_create_booking_slot_unavailable(db: Session, test_data, mocker):
    """Test booking when slot is unavailable"""
    # Mock authentication
    mocker.patch(
        "app.dependencies.get_current_user",
        return_value={"id": test_data["user"].id, "email": test_data["user"].email}
    )

    # Create a slot with capacity 1
    slot = create_test_slot(db)
    slot.capacity = 1
    db.commit()

    # Create first booking (should succeed)
    response = client.post(
        "/api/bookings/",
        json={"slot_id": slot.id}
    )
    assert response.status_code == 201

    # Create second user
    user2 = User(
        email="testuser2@example.com",
        hashed_password="hashed_password",
        first_name="Test",
        last_name="User2",
        is_active=True
    )
    db.add(user2)
    db.commit()

    # Mock authentication for second user
    mocker.patch(
        "app.dependencies.get_current_user",
        return_value={"id": user2.id, "email": user2.email}
    )

    # Attempt second booking (should fail as slot is full)
    response = client.post(
        "/api/bookings/",
        json={"slot_id": slot.id}
    )
    assert response.status_code == 400
    assert "fully booked" in response.json()["detail"]

def test_create_booking_duplicate(db: Session, test_data, mocker):
    """Test duplicate booking prevention"""
    # Mock authentication
    mocker.patch(
        "app.dependencies.get_current_user",
        return_value={"id": test_data["user"].id, "email": test_data["user"].email}
    )

    # Create first booking
    response = client.post(
        "/api/bookings/",
        json={"slot_id": test_data["slot"].id}
    )
    assert response.status_code == 201

    # Attempt duplicate booking
    response = client.post(
        "/api/bookings/",
        json={"slot_id": test_data["slot"].id}
    )
    assert response.status_code == 409
    assert "already booked" in response.json()["detail"]

def test_get_user_bookings(db: Session, test_data, mocker):
    """Test fetching user bookings"""
    # Mock authentication
    mocker.patch(
        "app.dependencies.get_current_user",
        return_value={"id": test_data["user"].id, "email": test_data["user"].email}
    )

    # Create booking
    booking = Booking(
        user_id=test_data["user"].id,
        slot_id=test_data["slot"].id,
        status="booked"
    )
    db.add(booking)
    db.commit()

    # Get user bookings
    response = client.get("/api/bookings/user")
    assert response.status_code == 200
    data = response.json()
    assert len(data["bookings"]) == 1
    assert data["bookings"][0]["slot_id"] == test_data["slot"].id
    assert data["bookings"][0]["user_id"] == test_data["user"].id

def test_get_specific_booking(db: Session, test_data, mocker):
    """Test retrieving a specific booking"""
    # Mock authentication
    mocker.patch(
        "app.dependencies.get_current_user",
        return_value={"id": test_data["user"].id, "email": test_data["user"].email}
    )

    # Create booking
    booking = Booking(
        user_id=test_data["user"].id,
        slot_id=test_data["slot"].id,
        status="booked"
    )
    db.add(booking)
    db.commit()

    # Get specific booking
    response = client.get(f"/api/bookings/{booking.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == booking.id
    assert data["slot_id"] == test_data["slot"].id
    assert data["user_id"] == test_data["user"].id
