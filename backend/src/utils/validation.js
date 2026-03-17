/**
 * Common validation functions for API requests
 */
const validation = {
  /**
   * Validates query parameters for pagination and filtering
   */
  validateQueryParams: (query) => {
    const errors = [];
    const result = {
      page: 1,
      limit: 10,
      startDate: null,
      endDate: null,
      status: null
    };

    // Validate page
    if (query.page) {
      const page = parseInt(query.page);
      if (isNaN(page) || page < 1) {
        errors.push('Page must be a positive number');
      } else {
        result.page = page;
      }
    }

    // Validate limit
    if (query.limit) {
      const limit = parseInt(query.limit);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        errors.push('Limit must be a number between 1 and 100');
      } else {
        result.limit = limit;
      }
    }

    // Validate dates
    if (query.startDate) {
      const startDate = new Date(query.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push('Invalid start date format');
      } else {
        result.startDate = startDate;
      }
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      if (isNaN(endDate.getTime())) {
        errors.push('Invalid end date format');
      } else {
        result.endDate = endDate;
      }
    }

    // Validate date range
    if (result.startDate && result.endDate && result.startDate > result.endDate) {
      errors.push('Start date cannot be after end date');
    }

    // Validate status
    if (query.status) {
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(query.status)) {
        errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
      } else {
        result.status = query.status;
      }
    }

    return { isValid: errors.length === 0, errors, validatedParams: result };
  }
};

module.exports = validation;
