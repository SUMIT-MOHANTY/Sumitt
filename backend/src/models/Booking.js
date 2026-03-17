/**
 * Booking model for appointment booking system
 */
class Booking {
  /**
   * Create a new Booking instance
   * @param {Object} data Booking data
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || data.user_id;
    this.slotId = data.slotId || data.slot_id;
    this.bookingDate = data.bookingDate || data.booking_date;
    this.status = data.status || 'pending';
    this.notes = data.notes || null;
    this.createdAt = data.createdAt || data.created_at || new Date();
    this.updatedAt = data.updatedAt || data.updated_at || new Date();

    this.validate();
  }

  /**
   * Validate booking data
   * @throws {Error} If validation fails
   */
  validate() {
    if (!this.userId) throw new Error('User ID is required');
    if (!this.slotId) throw new Error('Slot ID is required');
    if (!this.bookingDate) throw new Error('Booking date is required');

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(this.status)) {
      throw new Error(`Invalid status: ${this.status}. Must be one of: ${validStatuses.join(', ')}`);
    }
  }

  /**
   * Convert model to database representation
   * @returns {Object} Database representation
   */
  toDatabase() {
    return {
      id: this.id,
      user_id: this.userId,
      slot_id: this.slotId,
      booking_date: this.bookingDate,
      status: this.status,
      notes: this.notes,
      created_at: this.createdAt,
      updated_at: new Date()
    };
  }

  /**
   * Convert model to API representation
   * @returns {Object} API representation
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      slotId: this.slotId,
      bookingDate: this.bookingDate,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Booking;
