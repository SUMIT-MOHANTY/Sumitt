import Booking from '../models/booking';
import { Op } from 'sequelize';
import logger from '../utils/logger';

class BookingRepository {
  async create(bookingData: any): Promise<Booking> {
    try {
      return await Booking.create(bookingData);
    } catch (error) {
      logger.error(`Failed to create booking: ${error}`);
      throw new Error(`Failed to create booking: ${error}`);
    }
  }

  async findById(id: number): Promise<Booking | null> {
    try {
      return await Booking.findByPk(id);
    } catch (error) {
      logger.error(`Failed to find booking by id: ${error}`);
      throw new Error(`Failed to find booking by id: ${error}`);
    }
  }

  async findByUserId(userId: number): Promise<Booking[]> {
    try {
      return await Booking.findAll({ where: { userId } });
    } catch (error) {
      logger.error(`Failed to find bookings by user ID: ${error}`);
      throw new Error(`Failed to find bookings by user ID: ${error}`);
    }
  }

  async checkConflictingBooking(locationId: number, slotId: number, date: Date): Promise<boolean> {
    try {
      const booking = await Booking.findOne({
        where: {
          locationId,
          slotId,
          date,
          status: {
            [Op.ne]: 'cancelled'
          }
        }
      });
      return !!booking;
    } catch (error) {
      logger.error(`Failed to check conflicting booking: ${error}`);
      throw new Error(`Failed to check conflicting booking: ${error}`);
    }
  }

  async updateStatus(id: number, status: string): Promise<[number, Booking[]]> {
    try {
      return await Booking.update({ status }, { where: { id }, returning: true });
    } catch (error) {
      logger.error(`Failed to update booking status: ${error}`);
      throw new Error(`Failed to update booking status: ${error}`);
    }
  }
}

export default new BookingRepository();
