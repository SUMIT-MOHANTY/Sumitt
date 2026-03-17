/**
 * Admin Bookings API Endpoints
 * Provides analytics and management functionality for bookings
 */
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const validation = require('../../utils/validation');
const logger = require('../../utils/logger');

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings with pagination and filtering options for admin analytics
 * @access  Admin
 */
router.get('/', adminAuth, async (req, res) => {
  logger.info('Admin bookings request received', { query: req.query, user: req.user?.id });

  try {
    // Validate and sanitize query parameters
    const { isValid, errors, validatedParams } = validation.validateQueryParams(req.query);

    if (!isValid) {
      logger.warn('Invalid query parameters for admin bookings', { errors });
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors
      });
    }

    const { page, limit, startDate, endDate, status } = validatedParams;
    const skip = (page - 1) * limit;

    // Build query conditions based on filters
    const query = {};

    if (startDate && endDate) {
      query.bookingDate = {
        $gte: startDate,
        $lte: endDate
      };
    } else if (startDate) {
      query.bookingDate = { $gte: startDate };
    } else if (endDate) {
      query.bookingDate = { $lte: endDate };
    }

    if (status) {
      query.status = status;
    }

    // Assuming you have a Booking model or similar data access method
    // const Booking = require('../../models/Booking');

    // Mock bookings data for demonstration
    // In production, this would be replaced with actual database queries
    const mockBookings = [];
    for (let i = 0; i < limit; i++) {
      mockBookings.push({
        id: `booking-${skip + i + 1}`,
        userId: `user-${100 + i}`,
        serviceId: `service-${200 + i}`,
        bookingDate: new Date(),
        status: ['pending', 'confirmed', 'cancelled', 'completed'][i % 4],
        amount: Math.floor(Math.random() * 10000) / 100,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000))
      });
    }

    // Mock total count
    const totalBookings = 100;
    const totalPages = Math.ceil(totalBookings / limit);

    logger.info('Admin bookings retrieved successfully', {
      count: mockBookings.length,
      page,
      totalPages
    });

    // Return paginated results with metadata
    return res.status(200).json({
      success: true,
      data: {
        bookings: mockBookings,
        pagination: {
          total: totalBookings,
          page,
          limit,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching admin bookings', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
    });
  }
});

/**
 * @route   GET /api/admin/bookings/stats
 * @desc    Get booking statistics for admin dashboard
 * @access  Admin
 */
router.get('/stats', adminAuth, async (req, res) => {
  logger.info('Admin booking stats request received', { user: req.user?.id });

  try {
    // Mock statistics data for demonstration
    // In production, this would be calculated from actual bookings data
    const stats = {
      totalBookings: 547,
      pendingBookings: 32,
      confirmedBookings: 128,
      cancelledBookings: 45,
      completedBookings: 342,
      revenue: {
        total: 32458.97,
        thisMonth: 4523.50,
        previousMonth: 4125.75,
        percentageChange: 9.64
      },
      popularTimeSlots: [
        { hour: 9, count: 78 },
        { hour: 10, count: 92 },
        { hour: 11, count: 86 },
        { hour: 14, count: 74 },
        { hour: 15, count: 82 }
      ]
    };

    logger.info('Admin booking stats retrieved successfully');

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching admin booking stats', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking statistics',
      error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
    });
  }
});

module.exports = router;
