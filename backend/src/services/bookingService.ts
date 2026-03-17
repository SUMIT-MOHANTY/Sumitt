import bookingRepository from '../repositories/bookingRepository';
import emailService from './emailService';
import userRepository from '../repositories/userRepository';
import logger from '../utils/logger';

class BookingService {
  async createBooking(bookingData: any): Promise<any> {
    try {
      // Validate booking data
      if (!bookingData.userId || !bookingData.locationId || !bookingData.slotId || !bookingData.date) {
        throw new Error('Missing required booking information');
      }

      // Check for duplicate bookings
      const hasConflict = await bookingRepository.checkConflictingBooking(
        bookingData.locationId,
        bookingData.slotId,
        new Date(bookingData.date)
      );

      if (hasConflict) {
        logger.warn(`Duplicate booking attempt: slot already booked for location ${bookingData.locationId}, slot ${bookingData.slotId}, date ${bookingData.date}`);
        throw new Error('This slot is already booked for the selected date and location');
      }

      // Create the booking
      const booking = await bookingRepository.create({
        ...bookingData,
        status: 'pending'
      });

      // Get user for email notification
      const user = await userRepository.findById(bookingData.userId);
      if (!user) {
        logger.error(`User not found for booking: userId=${bookingData.userId}`);
        throw new Error('User not found');
      }

      // Send confirmation email
      await emailService.sendBookingConfirmation(booking, user);

      // Update booking status to confirmed
      const [, updatedBookings] = await bookingRepository.updateStatus(booking.id, 'confirmed');

      logger.info(`Booking created and confirmed: ${booking.id}`);
      return updatedBookings[0] || booking;
    } catch (error) {
      logger.error(`Booking creation failed: ${error}`);
      throw error;
    }
  }

  async getUserBookings(userId: number): Promise<any[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      return await bookingRepository.findByUserId(userId);
    } catch (error) {
      logger.error(`Failed to get user bookings: ${error}`);
      throw error;
    }
  }

  async cancelBooking(bookingId: number, userId: number): Promise<any> {
    try {
      const booking = await bookingRepository.findById(bookingId);

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.userId !== userId) {
        logger.warn(`Unauthorized cancellation attempt: User ${userId} attempted to cancel booking ${bookingId} owned by user ${booking.userId}`);
        throw new Error('Unauthorized: You can only cancel your own bookings');
      }

      const [, updatedBookings] = await bookingRepository.updateStatus(bookingId, 'cancelled');
      logger.info(`Booking ${bookingId} cancelled by user ${userId}`);

      return updatedBookings[0];
    } catch (error) {
      logger.error(`Booking cancellation failed: ${error}`);
      throw error;
    }
  }
}

export default new BookingService();
