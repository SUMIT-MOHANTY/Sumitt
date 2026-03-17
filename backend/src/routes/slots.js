const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const logger = require('../config/logger');
const { isValidObjectId } = require('mongoose');

/**
 * @route   GET /api/slots/search
 * @desc    Search for available slots based on query parameters
 * @access  Public
 */
router.get('/search', async (req, res, next) => {
  try {
    logger.info(`Searching slots with query params: ${JSON.stringify(req.query)}`);
    const {
      date,
      startDate,
      endDate,
      locationId,
      available = true
    } = req.query;

    // Validate inputs
    if (locationId && !isValidObjectId(locationId)) {
      logger.warn(`Invalid locationId format: ${locationId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid locationId format'
      });
    }

    // Build query object
    const query = {};

    // Handle date filtering
    if (date) {
      // Single date search
      const searchDate = new Date(date);
      if (isNaN(searchDate.getTime())) {
        logger.warn(`Invalid date format: ${date}`);
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      // Set to beginning of day
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);

      // Set to end of day
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      // Date range search
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        logger.warn(`Invalid date range format: ${startDate} - ${endDate}`);
        return res.status(400).json({
          success: false,
          error: 'Invalid date range format. Use YYYY-MM-DD'
        });
      }

      // Set to beginning of start day and end of end day
      startDateObj.setHours(0, 0, 0, 0);
      endDateObj.setHours(23, 59, 59, 999);

      query.date = { $gte: startDateObj, $lte: endDateObj };
    }

    // Filter by locationId if provided
    if (locationId) {
      query.locationId = locationId;
    }

    // Filter by availability if specified
    if (available === 'true' || available === true) {
      query.available = true;
    } else if (available === 'false' || available === false) {
      query.available = false;
    }

    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const slots = await Slot.find(query)
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Slot.countDocuments(query);

    logger.info(`Found ${slots.length} slots matching query`);

    // Return successful response with pagination metadata
    return res.json({
      success: true,
      count: slots.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: slots
    });

  } catch (error) {
    logger.error(`Error searching slots: ${error.message}`);
    next(error);
  }
});

module.exports = router;
