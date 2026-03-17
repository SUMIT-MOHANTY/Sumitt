import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any
import logging
from fastapi import BackgroundTasks
from ..core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.sender_email = settings.SMTP_USER
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD

    def _create_booking_confirmation_email(self, recipient: str, booking_data: Dict[str, Any]) -> MIMEMultipart:
        """Create a booking confirmation email message"""
        message = MIMEMultipart("alternative")
        message["Subject"] = "Passport Appointment Confirmation"
        message["From"] = self.sender_email
        message["To"] = recipient

        # Create HTML content
        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #004080; color: white; padding: 10px; text-align: center; }}
                .content {{ padding: 20px; }}
                .footer {{ text-align: center; font-size: 12px; color: #666; padding: 10px; }}
                .info {{ margin: 15px 0; }}
                .ref-number {{ font-weight: bold; color: #004080; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Passport Appointment Confirmation</h1>
                </div>
                <div class="content">
                    <p>Dear {booking_data.get('user_name', 'Valued Customer')},</p>
                    <p>Your passport appointment has been successfully booked.</p>

                    <div class="info">
                        <p><strong>Booking Reference:</strong> <span class="ref-number">#{booking_data.get('id', 'N/A')}</span></p>
                        <p><strong>Date:</strong> {booking_data.get('date', 'N/A')}</p>
                        <p><strong>Time:</strong> {booking_data.get('time', 'N/A')}</p>
                        <p><strong>Location:</strong> {booking_data.get('location', 'N/A')}</p>
                    </div>

                    <p>Please arrive 15 minutes before your appointment time with all required documents.</p>
                    <p>If you need to reschedule or cancel, please log in to your account.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Attach HTML content
        message.attach(MIMEText(html, "html"))
        return message

    def send_booking_confirmation(self, recipient_email: str, booking_data: Dict[str, Any]) -> bool:
        """
        Send a booking confirmation email to the user
        Returns True if successful, False otherwise
        """
        try:
            message = self._create_booking_confirmation_email(recipient_email, booking_data)

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(message)

            logger.info(f"Booking confirmation email sent to {recipient_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send booking confirmation email: {str(e)}")
            return False

    def send_booking_confirmation_async(
        self, background_tasks: BackgroundTasks, recipient_email: str, booking_data: Dict[str, Any]
    ):
        """Add email sending to background tasks"""
        background_tasks.add_task(self.send_booking_confirmation, recipient_email, booking_data)
