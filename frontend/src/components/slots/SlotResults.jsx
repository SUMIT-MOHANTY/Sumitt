import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Badge, Card, Col, Row, Spinner, Button } from 'react-bootstrap';
import DOMPurify from 'dompurify'; // Security: Sanitize HTML

// Security: Create a simple logging utility
const logger = {
  info: (message, data = {}) => {
    // Filter sensitive data before logging
    const sanitizedData = { ...data };
    delete sanitizedData.userId;
    delete sanitizedData.authToken;
    console.info(message, sanitizedData);
  },
  error: (message, error = {}) => {
    console.error(message, error);
  }
};

// Security: Helper function to safely format date/time
const formatDateTime = (dateStr, timeStr) => {
  try {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${timeStr || ''}`.trim();
  } catch (error) {
    logger.error('Date formatting error', error);
    return 'Invalid date';
  }
};

const SlotResults = ({
  slots = [],
  isLoading = false,
  error = null,
  onBookSlot,
  onLoadMore,
  hasMore = false
}) => {
  const [bookingInProgress, setBookingInProgress] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Security: Track booking attempts for rate limiting
  const [bookingAttempts, setBookingAttempts] = useState(0);
  const MAX_BOOKING_ATTEMPTS = 5;

  // Security: Reset booking attempts after a certain period
  React.useEffect(() => {
    if (bookingAttempts > 0) {
      const timer = setTimeout(() => setBookingAttempts(0), 60000); // Reset after 1 minute
      return () => clearTimeout(timer);
    }
  }, [bookingAttempts]);

  const handleBookSlot = async (slotId) => {
    // Security: Implement rate limiting for booking attempts
    if (bookingAttempts >= MAX_BOOKING_ATTEMPTS) {
      setBookingError("Too many booking attempts. Please try again later.");
      return;
    }

    setBookingInProgress(slotId);
    setBookingError(null);
    setBookingAttempts(prev => prev + 1);

    try {
      logger.info('Booking slot attempt', { slotId });
      await onBookSlot(slotId);
    } catch (err) {
      logger.error('Booking error', err);
      setBookingError("Failed to book slot. Please try again.");
    } finally {
      setBookingInProgress(null);
    }
  };

  // Security: Safely render availability status with appropriate color
  const renderAvailabilityStatus = (slot) => {
    if (!slot || typeof slot.available !== 'boolean') return null;

    return slot.available ? (
      <Badge bg="success" data-testid="available-badge">Available</Badge>
    ) : (
      <Badge bg="secondary" data-testid="unavailable-badge">Unavailable</Badge>
    );
  };

  // Security: Handle no results scenario
  if (!isLoading && !error && slots.length === 0) {
    return (
      <div className="slot-results-container">
        <Alert variant="info">
          No slots found matching your criteria. Try adjusting your search parameters.
        </Alert>
      </div>
    );
  }

  return (
    <div className="slot-results-container" data-testid="slot-results">
      <h2>Available Slots</h2>

      {error && (
        <Alert variant="danger" onClose={() => setBookingError(null)} dismissible>
          {error}
        </Alert>
      )}

      {bookingError && (
        <Alert variant="danger" onClose={() => setBookingError(null)} dismissible>
          {bookingError}
        </Alert>
      )}

      {isLoading && slots.length === 0 ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading available slots...</p>
        </div>
      ) : (
        <>
          <Row xs={1} md={2} lg={3} className="g-4">
            {slots.map((slot) => (
              <Col key={slot.id}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title className="d-flex justify-content-between align-items-center">
                      {/* Security: Sanitize provider name */}
                      <span>{DOMPurify.sanitize(slot.provider || 'Unknown Provider')}</span>
                      {renderAvailabilityStatus(slot)}
                    </Card.Title>
                    <Card.Text as="div">
                      <div className="mb-2">
                        <strong>Date:</strong> {formatDateTime(slot.date, '')}
                      </div>
                      <div className="mb-2">
                        <strong>Time:</strong> {slot.startTime || 'N/A'} - {slot.endTime || 'N/A'}
                      </div>
                      <div className="mb-2">
                        {/* Security: Sanitize location */}
                        <strong>Location:</strong> {DOMPurify.sanitize(slot.location || 'N/A')}
                      </div>
                      {slot.notes && (
                        <div className="mb-2">
                          {/* Security: Sanitize notes */}
                          <strong>Notes:</strong> <span dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(slot.notes, {
                              ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
                              ALLOWED_ATTR: []
                            })
                          }} />
                        </div>
                      )}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      variant={slot.available ? "primary" : "secondary"}
                      disabled={!slot.available || bookingInProgress === slot.id}
                      onClick={() => slot.available && handleBookSlot(slot.id)}
                      aria-label={`Book slot with ${slot.provider || 'provider'} on ${formatDateTime(slot.date, slot.startTime)}`}
                      className="w-100"
                    >
                      {bookingInProgress === slot.id ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          <span className="ms-2">Booking...</span>
                        </>
                      ) : slot.available ? 'Book Slot' : 'Unavailable'}
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          {hasMore && (
            <div className="text-center mt-4">
              <Button
                variant="outline-primary"
                onClick={onLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Loading...</span>
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

SlotResults.propTypes = {
  slots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      provider: PropTypes.string,
      date: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
      location: PropTypes.string,
      notes: PropTypes.string,
      available: PropTypes.bool,
    })
  ),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onBookSlot: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func,
  hasMore: PropTypes.bool
};

export default SlotResults;
