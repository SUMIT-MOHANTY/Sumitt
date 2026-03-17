const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { createSlotRules, validateSlot } = require('../../middleware/slotsValidator');
const logger = require('../../utils/logger');

/**
 * @route   POST /api/admin/slots
 * @desc    Create a new time slot
 * @access  Admin only
 */
router.post('/', adminAuth, createSlotRules, validateSlot, async (req, res) => {
  try {
    const { date, startTime, endTime, capacity = 1, available = true, price = 0 } = req.body;

    // In a real app, you would interact with your database here
    // This is a mock implementation for demonstration purposes
    const newSlot = {
      id: Date.now().toString(),
      date,
      startTime,
      endTime,
      capacity,
      available,
      price,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    logger.info(`Admin ${req.user.id} created new slot: ${JSON.stringify(newSlot)}`);

    res.status(201).json({
      success: true,
      message: 'Time slot created successfully',
      data: newSlot
    });
  } catch (error) {
    logger.error(`Failed to create slot: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while creating slot',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});

module.exports = router;
