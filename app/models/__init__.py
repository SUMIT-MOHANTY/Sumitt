"""Model initialization."""
from app.models.base import Base
from app.models.location import Location
from app.models.slot import Slot

__all__ = ["Base", "Location", "Slot"]
