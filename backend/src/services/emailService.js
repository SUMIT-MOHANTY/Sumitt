/**
 * Email Service for sending appointment confirmations
 */
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
      tls: {
        rejectUnauthorized: false // For development only, remove in production
      }
    });
  }

  /**
   * Send appointment confirmation email
   * @param {Object} appointment - The appointment details
   * @param {Object} user - The user who made the booking
   * @returns {Promise<Object>} Email send result
   */
  async sendAppointmentConfirmation(appointment, user) {
    try {
      if (!appointment || !user) {
        logger.error('Missing required appointment or user data');
        throw new Error('Missing required appointment or user data');
      }

      if (!user.email) {
        logger.error('User email is required');
        throw new Error('User email is required');
      }

      const { location, date, time } = appointment;

      // Format date for email display
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: config.email.from,
        to: user.email,
        subject: 'Your Appointment Confirmation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Appointment Confirmation</h2>
            <p>Dear ${user.name || user.email},</p>
            <p>Your appointment has been successfully scheduled. Here are the details:</p>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Location:</strong> ${location?.name || 'N/A'}</p>
              <p><strong>Address:</strong> ${location?.address || 'N/A'}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${time}</p>
            </div>

            <p>Please arrive 10 minutes before your scheduled time.</p>
            <p>If you need to reschedule or cancel, please log in to your account or contact us.</p>

            <p>Thank you for choosing our service!</p>
            <p>The Appointment Team</p>
          </div>
        `,
        text: `
          Appointment Confirmation

          Dear ${user.name || user.email},

          Your appointment has been successfully scheduled. Here are the details:

          Location: ${location?.name || 'N/A'}
          Address: ${location?.address || 'N/A'}
          Date: ${formattedDate}
          Time: ${time}

          Please arrive 10 minutes before your scheduled time.
          If you need to reschedule or cancel, please log in to your account or contact us.

          Thank you for choosing our service!
          The Appointment Team
        `
      };

      logger.info(`Sending confirmation email to ${user.email}`);
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Failed to send confirmation email: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new EmailService();
