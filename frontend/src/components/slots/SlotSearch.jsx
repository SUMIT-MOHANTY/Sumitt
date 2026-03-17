import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Security: Define validation schema with strict input requirements
const searchSchema = yup.object().shape({
  date: yup.date().nullable().default(null),
  startTime: yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format')
    .nullable(),
  endTime: yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format')
    .nullable(),
  location: yup.string().trim().max(100).nullable(),
  provider: yup.string().trim().max(100).nullable(),
});

// Create a logging utility that won't expose sensitive data
const logger = {
  info: (message, data = {}) => {
    // Filter out sensitive information before logging
    const sanitizedData = { ...data };
    delete sanitizedData.authToken;
    console.info(message, sanitizedData);
  },
  error: (message, error = {}) => {
    console.error(message, error);
  }
};

const SlotSearch = ({ onSearch, initialValues = {} }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const lastSearchTime = useRef(null);

  // Security: Use React Hook Form with yup validation
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(searchSchema),
    defaultValues: initialValues
  });

  // Security: Implement rate limiting for search submissions
  const MIN_SEARCH_INTERVAL = 1000; // 1 second between searches
  const MAX_SEARCHES_PER_MINUTE = 20;

  useEffect(() => {
    // Security: Reset submission count every minute
    const interval = setInterval(() => {
      setSubmissionCount(0);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Security: Apply debounce to prevent excessive API calls
  const debouncedSearch = useRef(
    debounce(async (data) => {
      try {
        setIsLoading(true);
        setError(null);

        // Security: Log search attempt (excluding sensitive data)
        logger.info('Slot search initiated', {
          criteria: {
            date: data.date,
            hasTimeRange: !!data.startTime && !!data.endTime,
            hasLocation: !!data.location
          }
        });

        // Security: Sanitize inputs before passing to parent
        const sanitizedData = {
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : null,
          startTime: data.startTime || null,
          endTime: data.endTime || null,
          location: data.location ? data.location.trim() : null,
          provider: data.provider ? data.provider.trim() : null,
        };

        await onSearch(sanitizedData);

        // Security: Update last search time for rate limiting
        lastSearchTime.current = Date.now();
      } catch (err) {
        // Security: Handle errors without exposing sensitive details
        logger.error('Search error', err);
        setError('An error occurred while searching for slots. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300)
  ).current;

  const onSubmit = async (data) => {
    // Security: Implement rate limiting
    const now = Date.now();
    if (lastSearchTime.current && (now - lastSearchTime.current < MIN_SEARCH_INTERVAL)) {
      setError('Please wait a moment before searching again.');
      return;
    }

    // Security: Check for excessive searches
    if (submissionCount >= MAX_SEARCHES_PER_MINUTE) {
      setError('Search limit exceeded. Please wait a minute and try again.');
      return;
    }

    setSubmissionCount(prev => prev + 1);
    debouncedSearch(data);
  };

  const handleReset = () => {
    reset({
      date: null,
      startTime: '',
      endTime: '',
      location: '',
      provider: '',
    });
    setError(null);
  };

  return (
    <div className="slot-search-container" data-testid="slot-search">
      <h2>Find Available Slots</h2>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="date">Date</Form.Label>
          <Form.Control
            id="date"
            type="date"
            aria-describedby="dateHelp"
            isInvalid={!!errors.date}
            {...register('date')}
          />
          {errors.date && <Form.Text className="text-danger">{errors.date.message}</Form.Text>}
        </Form.Group>

        <div className="row">
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label htmlFor="startTime">Start Time</Form.Label>
              <Form.Control
                id="startTime"
                type="time"
                isInvalid={!!errors.startTime}
                {...register('startTime')}
              />
              {errors.startTime && <Form.Text className="text-danger">{errors.startTime.message}</Form.Text>}
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label htmlFor="endTime">End Time</Form.Label>
              <Form.Control
                id="endTime"
                type="time"
                isInvalid={!!errors.endTime}
                {...register('endTime')}
              />
              {errors.endTime && <Form.Text className="text-danger">{errors.endTime.message}</Form.Text>}
            </Form.Group>
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="location">Location</Form.Label>
          <Form.Control
            id="location"
            type="text"
            maxLength={100} // Security: Enforce max length
            placeholder="Enter location"
            isInvalid={!!errors.location}
            {...register('location')}
          />
          {errors.location && <Form.Text className="text-danger">{errors.location.message}</Form.Text>}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="provider">Provider</Form.Label>
          <Form.Control
            id="provider"
            type="text"
            maxLength={100} // Security: Enforce max length
            placeholder="Enter provider name"
            isInvalid={!!errors.provider}
            {...register('provider')}
          />
          {errors.provider && <Form.Text className="text-danger">{errors.provider.message}</Form.Text>}
        </Form.Group>

        <div className="d-flex gap-2">
          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
            aria-label="Search for slots"
          >
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Searching...</span>
              </>
            ) : (
              'Search'
            )}
          </Button>
          <Button
            variant="outline-secondary"
            onClick={handleReset}
            disabled={isLoading}
            aria-label="Reset search form"
          >
            Reset
          </Button>
        </div>
      </Form>
    </div>
  );
};

SlotSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    date: PropTypes.instanceOf(Date),
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    location: PropTypes.string,
    provider: PropTypes.string,
  }),
};

export default SlotSearch;
