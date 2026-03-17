import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Dict, Any, Optional
import time
from pathlib import Path

from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    """
    Service to handle email sending functionality with retry capability
    """
    def __init__(self):
        self.smtp_server = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAIL_FROM
        self.from_name = settings.EMAIL_FROM_NAME
        self.enabled = settings.EMAILS_ENABLED
        self.backend = settings.EMAIL_BACKEND
        self.max_retries = 3
        self.retry_delay = 2  # seconds

    def _send_smtp_email(self,
                        email_to: str,
                        subject: str,
                        html_content: str,
                        plain_content: str) -> bool:
        """Send email via SMTP"""
        if not self.enabled:
            logger.info("Email sending is disabled. Email would have been sent to: %s", email_to)
            return True

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = email_to

        # Add plain text and HTML parts
        part1 = MIMEText(plain_content, "plain")
        part2 = MIMEText(html_content, "html")
        message.attach(part1)
        message.attach(part2)

        retries = 0
        while retries < self.max_retries:
            try:
                if self.backend == "SMTP":
                    with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                        if settings.SMTP_TLS:
                            server.starttls()
                        if self.smtp_user and self.smtp_password:
                            server.login(self.smtp_user, self.smtp_password)
                        server.sendmail(self.from_email, email_to, message.as_string())
                    logger.info(f"Email sent successfully to {email_to}")
                    return True
                elif self.backend == "CONSOLE":
                    logger.info(f"[CONSOLE EMAIL] To: {email_to}")
                    logger.info(f"[CONSOLE EMAIL] Subject: {subject}")
                    logger.info(f"[CONSOLE EMAIL] Content: {plain_content}")
                    return True
            except Exception as e:
                retries += 1
                logger.error(f"Failed to send email to {email_to}. Attempt {retries}/{self.max_retries}. Error: {e}")
                if retries < self.max_retries:
                    time.sleep(self.retry_delay)

        logger.error(f"Failed to send email after {self.max_retries} attempts")
        return False

    def send_appointment_confirmation(self,
                                     email_to: str,
                                     appointment_details: Dict[str, Any]) -> bool:
        """
        Send appointment confirmation email

        Args:
            email_to: Recipient email address
            appointment_details: Dictionary containing appointment information
                - location_name: str
                - location_address: str
                - date: str (YYYY-MM-DD)
                - time: str (HH:MM)
                - booking_id: str
                - user_name: str

        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        from backend.app.templates.email_templates import get_appointment_confirmation_template

        subject = f"Passport Appointment Confirmation - {appointment_details['date']}"
        html_content, plain_content = get_appointment_confirmation_template(appointment_details)

        return self._send_smtp_email(
            email_to=email_to,
            subject=subject,
            html_content=html_content,
            plain_content=plain_content
        )

# Create a singleton instance
email_service = EmailService()
