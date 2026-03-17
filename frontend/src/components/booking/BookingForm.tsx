import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

interface Location {
  id: number;
  name: string;
}

interface Slot {
  id: number;
  startTime: string;
  endTime: string;
}

const BookingForm: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available locations when component mounts
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/locations');
        setLocations(response.data);
        setError(null);
      } catch (err: any) {
        setError('Failed to load locations. Please try again later.');
        console.error('Error fetching locations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Fetch slots for selected location
  const fetchSlots = async (locationId: number) => {
    if (!locationId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/slots?locationId=${locationId}`);
      setSlots(response.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to load time slots. Please try again later.');
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  // Form validation schema
  const validationSchema = Yup.object({
    locationId: Yup.number().required('Please select a location'),
    slotId: Yup.number().required('Please select a time slot'),
    date: Yup.date()
      .required('Date is required')
      .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Date cannot be in the past')
  });

  return (
    <div className="booking-form-container">
      <h2>Book an Appointment</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && (
        <div className="alert alert-success">
          Booking confirmed! You will receive a confirmation email shortly.
          <button
            className="btn btn-link"
            onClick={() => navigate('/my-bookings')}
          >
            View My Bookings
          </button>
        </div>
      )}

      <Formik
        initialValues={{
          locationId: '',
          slotId: '',
          date: ''
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            setLoading(true);
            setError(null);

            await axios.post('/api/bookings', {
              locationId: Number(values.locationId),
              slotId: Number(values.slotId),
              date: values.date
            });

            setSuccess(true);
            resetForm();
            setTimeout(() => {
              navigate('/my-bookings');
            }, 3000);
          } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to create booking. Please try again.';
            setError(errorMsg);
            console.error('Booking error:', err);
          } finally {
            setSubmitting(false);
            setLoading(false);
          }
        }}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            <div className="form-group mb-3">
              <label htmlFor="locationId">Location</label>
              <Field
                as="select"
                id="locationId"
                name="locationId"
                className="form-control"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const locationId = Number(e.target.value);
                  setFieldValue('locationId', locationId);
                  setFieldValue('slotId', ''); // Reset slot when location changes
                  fetchSlots(locationId);
                }}
                disabled={loading || isSubmitting}
              >
                <option value="">Select a location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </Field>
              <ErrorMessage name="locationId" component="div" className="text-danger" />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="slotId">Time Slot</label>
              <Field
                as="select"
                id="slotId"
                name="slotId"
                className="form-control"
                disabled={!values.locationId || loading || isSubmitting}
              >
                <option value="">Select a time slot</option>
                {slots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="slotId" component="div" className="text-danger" />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="date">Date</label>
              <Field
                type="date"
                id="date"
                name="date"
                className="form-control"
                min={new Date().toISOString().split('T')[0]}
                disabled={loading || isSubmitting}
              />
              <ErrorMessage name="date" component="div" className="text-danger" />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BookingForm;
