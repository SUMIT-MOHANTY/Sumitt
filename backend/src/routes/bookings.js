/**
 * bookings.js - API routes for booking management
 *
 * This file contains all the routes related to booking operations
 * including creating, retrieving, updating, and cancelling bookings.
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      serviceId,
      date,
      startTime,
      endTime,
      notes
    } = req.body;

    logger.info(`Creating new booking for service ${serviceId}`);

    // Validate request body
    if (!serviceId || !date || !startTime || !endTime) {
      logger.warn('Booking creation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide serviceId, date, startTime, and endTime'
      });
    }

    // Validate date format
    const bookingDate = new Date(date);
    if (isNaN(bookingDate)) {
      logger.warn(`Booking creation failed: Invalid date format - ${date}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use YYYY-MM-DD format'
      });
    }

    // Validate that booking date is in the future
    const currentDate = new Date();
    if (bookingDate < currentDate.setHours(0, 0, 0, 0)) {
      logger.warn(`Booking creation failed: Past date provided - ${date}`);
      return res.status(400).json({
        success: false,
        message: 'Booking date must be in the future'
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      logger.warn(`Booking creation failed: Invalid time format - start: ${startTime}, end: ${endTime}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Please use HH:MM format'
      });
    }

    // Validate that startTime is before endTime
    if (startTime >= endTime) {
      logger.warn(`Booking creation failed: Start time is after or equal to end time - start: ${startTime}, end: ${endTime}`);
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }

    // Check if the service exists
    const service = await Service.findById(serviceId).session(session);
    if (!service) {
      logger.warn(`Booking creation failed: Service not found - ${serviceId}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Calculate booking duration in hours
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const durationHours =
      (endHour - startHour) +
      (endMinute - startMinute) / 60;

    // Calculate total price
    const totalPrice = service.pricePerHour * durationHours;

    // Check for booking conflicts
    const hasConflict = await Booking.hasConflict(
      serviceId,
      bookingDate,
      startTime,
      endTime
    );

    if (hasConflict) {
      logger.warn(`Booking creation failed: Time slot conflict for service ${serviceId}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: 'The selected time slot is not available'
      });
    }

    // Create and save the new booking
    const newBooking = new Booking({
      userId: req.user.id,
      serviceId,
      date: bookingDate,
      startTime,
      endTime,
      notes,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending'
    });

    const savedBooking = await newBooking.save({ session });

    // Populate service and user details for response
    await savedBooking.populate('serviceId', 'name description').execPopulate();

    await session.commitTransaction();
    session.endSession();

    logger.info(`Booking created successfully: ${savedBooking._id}`);

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        _id: savedBooking._id,
        service: savedBooking.serviceId,
        date: savedBooking.date,
        startTime: savedBooking.startTime,
        endTime: savedBooking.endTime,
        status: savedBooking.status,
        paymentStatus: savedBooking.paymentStatus,
        totalPrice: savedBooking.totalPrice,
        notes: savedBooking.notes,
        createdAt: savedBooking.createdAt
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error creating booking: ${error.message}`);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
      error: error.message
    });
  }
});

// Export the router
module.exports = router;
