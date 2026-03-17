import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import logger from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // For production, use environment variables for these settings
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'user@example.com',
        pass: process.env.EMAIL_PASS || 'password',
      },
    });
  }

  async sendBookingConfirmation(booking: any, user: any): Promise<void> {
    try {
      const template = this.loadTemplate('booking-confirmation');
      const html = template({
        userName: user.name,
        bookingId: booking.id,
        date: new Date(booking.date).toLocaleDateString(),
        location: booking.locationName || 'Our Location',
        slot: booking.slotName || 'Your Time Slot'
      });

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Appointment System" <appointments@example.com>',
        to: user.email,
        subject: 'Your Booking Confirmation',
        html
      });

      logger.info(`Booking confirmation email sent to ${user.email}`);
    } catch (error) {
      logger.error(`Failed to send booking confirmation email: ${error}`);
      // Don't throw error, just log it - don't want email failure to break booking process
    }
  }

  private loadTemplate(templateName: string) {
    try {
      const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
      const templateSource = fs.existsSync(templatePath)
        ? fs.readFileSync(templatePath, 'utf8')
        : '<h1>Booking Confirmation</h1><p>Dear {{userName}},</p><p>Your booking (ID: {{bookingId}}) has been confirmed for {{date}} at {{location}}.</p>';

      return Handlebars.compile(templateSource);
    } catch (error) {
      logger.error(`Failed to load email template: ${error}`);
      // Return a simple backup template
      return Handlebars.compile('<h1>Booking Confirmation</h1><p>Your booking has been confirmed.</p>');
    }
  }
}

export default new EmailService();
