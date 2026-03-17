# Passport Appointment Booking System

A system that allows users to book available slots for passport appointments.

## Features

- User authentication and authorization
- Slot availability checking
- Booking creation and management
- Prevention of duplicate bookings

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and update the variables
4. Start the server: `npm run dev`

## API Endpoints

### Bookings

- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/my-bookings` - Get the authenticated user's bookings

## Testing

Run tests with: `npm test`

## License

MIT
