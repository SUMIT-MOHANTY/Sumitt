const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bookingService = require('../../../services/booking.service');
const Booking = require('../../../models/booking');
const Slot = require('../../../models/slot');
const User = require('../../../models/user');

let mongoServer;

// Mock data
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test User',
  email: 'test@example.com'
};

const mockSlot = {
  _id: new mongoose.Types.ObjectId(),
  date: new Date('2023-12-01'),
  startTime: '10:00',
  endTime: '10:30',
  capacity: 1,
  booked: 0,
  location: 'Test Location',
  isAvailable: true
};

const mockBooking = {
  _id: new mongoose.Types.ObjectId(),
  userId: mockUser._id,
  slotId: mockSlot._id,
  status: 'confirmed'
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  await Slot.deleteMany({});
  await User.deleteMany({});
});

describe('BookingService', () => {
  describe('isSlotAvailable', () => {
    it('should return true if slot is available', async () => {
      await Slot.create(mockSlot);
      const result = await bookingService.isSlotAvailable(mockSlot._id);
      expect(result).toBe(true);
    });

    it('should return false if slot is fully booked', async () => {
      await Slot.create({
        ...mockSlot,
        booked: mockSlot.capacity
      });
      const result = await bookingService.isSlotAvailable(mockSlot._id);
      expect(result).toBe(false);
    });

    it('should throw error if slot not found', async () => {
      await expect(bookingService.isSlotAvailable(new mongoose.Types.ObjectId()))
        .rejects.toThrow('Slot not found');
    });
  });

  describe('hasExistingBooking', () => {
    it('should return true if booking exists', async () => {
      await Booking.create(mockBooking);
      const result = await bookingService.hasExistingBooking(mockUser._id, mockSlot._id);
      expect(result).toBe(true);
    });

    it('should return false if booking does not exist', async () => {
      const result = await bookingService.hasExistingBooking(mockUser._id, mockSlot._id);
      expect(result).toBe(false);
    });
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      await Slot.create(mockSlot);
      const booking = await bookingService.createBooking(mockUser._id, mockSlot._id);

      expect(booking).toBeDefined();
      expect(booking.userId.toString()).toBe(mockUser._id.toString());
      expect(booking.slotId.toString()).toBe(mockSlot._id.toString());

      // Check if slot was updated
      const updatedSlot = await Slot.findById(mockSlot._id);
      expect(updatedSlot.booked).toBe(1);
    });

    it('should throw error if slot is already booked', async () => {
      await Slot.create({
        ...mockSlot,
        booked: mockSlot.capacity
      });

      await expect(bookingService.createBooking(mockUser._id, mockSlot._id))
        .rejects.toThrow('Slot is no longer available');
    });

    it('should throw error if duplicate booking', async () => {
      await Slot.create(mockSlot);
      await Booking.create(mockBooking);

      await expect(bookingService.createBooking(mockUser._id, mockSlot._id))
        .rejects.toThrow('You already have a booking for this slot');
    });
  });
});
