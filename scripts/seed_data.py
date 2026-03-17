"""Seed data script for locations and slots."""
import os
import sys
from datetime import date, time, timedelta
import logging
from pathlib import Path

# Add parent directory to path so we can import from app
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, Location, Slot

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/passport_booking")

def create_locations(session):
    """Create sample locations."""
    logger.info("Creating sample locations...")

    locations = [
        Location(
            name="Downtown Passport Office",
            address="123 Main Street, Downtown, City 10001",
            capacity=20
        ),
        Location(
            name="Westside Government Center",
            address="456 West Avenue, Westside, City 10002",
            capacity=15
        ),
        Location(
            name="Eastside Municipal Building",
            address="789 East Boulevard, Eastside, City 10003",
            capacity=10
        ),
    ]

    for location in locations:
        # Check if location already exists to avoid duplicates
        existing = session.query(Location).filter(Location.name == location.name).first()
        if not existing:
            session.add(location)
            logger.info(f"Added location: {location.name}")
        else:
            logger.info(f"Location already exists: {location.name}")

    session.commit()
    return locations

def create_slots(session, locations):
    """Create sample appointment slots for each location."""
    logger.info("Creating sample slots...")

    # Generate slots for the next 30 days
    today = date.today()
    slots_created = 0

    for location in locations:
        for day_offset in range(30):
            slot_date = today + timedelta(days=day_offset)

            # Morning slot: 9:00 - 10:00
            morning_slot = Slot(
                location_id=location.id,
                date=slot_date,
                start_time=time(9, 0),
                end_time=time(10, 0),
                max_bookings=location.capacity // 2  # Half capacity for each slot
            )

            # Afternoon slot: 14:00 - 15:00
            afternoon_slot = Slot(
                location_id=location.id,
                date=slot_date,
                start_time=time(14, 0),
                end_time=time(15, 0),
                max_bookings=location.capacity // 2  # Half capacity for each slot
            )

            # Check if slots already exist to avoid duplicates
            existing_morning = session.query(Slot).filter(
                Slot.location_id == location.id,
                Slot.date == slot_date,
                Slot.start_time == morning_slot.start_time
            ).first()

            existing_afternoon = session.query(Slot).filter(
                Slot.location_id == location.id,
                Slot.date == slot_date,
                Slot.start_time == afternoon_slot.start_time
            ).first()

            if not existing_morning:
                session.add(morning_slot)
                slots_created += 1

            if not existing_afternoon:
                session.add(afternoon_slot)
                slots_created += 1

    session.commit()
    logger.info(f"Created {slots_created} new slots")

def main():
    """Main function to seed the database."""
    try:
        logger.info(f"Connecting to database: {DATABASE_URL}")
        engine = create_engine(DATABASE_URL)

        # Create tables if they don't exist
        Base.metadata.create_all(engine)

        # Create session
        Session = sessionmaker(bind=engine)
        session = Session()

        # Create locations and slots
        locations = create_locations(session)
        create_slots(session, locations)

        logger.info("Database seeding completed successfully!")

    except Exception as e:
        logger.error(f"Error seeding database: {str(e)}")
        raise

if __name__ == "__main__":
    main()
