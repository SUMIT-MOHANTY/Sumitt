from typing import Dict, Any, Tuple

def get_appointment_confirmation_template(appointment_details: Dict[str, Any]) -> Tuple[str, str]:
    """
    Generate HTML and plain text templates for appointment confirmation emails

    Args:
        appointment_details: Dictionary containing appointment information
            - location_name: str
            - location_address: str
            - date: str (YYYY-MM-DD)
            - time: str (HH:MM)
            - booking_id: str
            - user_name: str

    Returns:
        Tuple containing (html_content, plain_text_content)
    """
    location_name = appointment_details.get('location_name', '')
    location_address = appointment_details.get('location_address', '')
    date = appointment_details.get('date', '')
    time = appointment_details.get('time', '')
    booking_id = appointment_details.get('booking_id', '')
    user_name = appointment_details.get('user_name', '')

    # HTML email template
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Passport Appointment Confirmation</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #0066cc;
                color: #ffffff;
                padding: 15px;
                text-align: center;
            }}
            .content {{
                padding: 20px;
                border: 1px solid #dddddd;
            }}
            .details {{
                margin: 20px 0;
                border: 1px solid #dddddd;
                border-collapse: collapse;
                width: 100%;
            }}
            .details td, .details th {{
                border: 1px solid #dddddd;
                padding: 8px;
            }}
            .details th {{
                background-color: #f2f2f2;
                text-align: left;
            }}
            .footer {{
                margin-top: 20px;
                font-size: 12px;
                color: #777777;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Passport Appointment Confirmation</h1>
            </div>
            <div class="content">
                <p>Dear {user_name},</p>
                <p>Your passport appointment has been successfully booked. Please find the details below:</p>

                <table class="details">
                    <tr>
                        <th>Booking Reference</th>
                        <td>{booking_id}</td>
                    </tr>
                    <tr>
                        <th>Location</th>
                        <td>{location_name}</td>
                    </tr>
                    <tr>
                        <th>Address</th>
                        <td>{location_address}</td>
                    </tr>
                    <tr>
                        <th>Date</th>
                        <td>{date}</td>
                    </tr>
                    <tr>
                        <th>Time</th>
                        <td>{time}</td>
                    </tr>
                </table>

                <p>Please arrive 15 minutes before your scheduled appointment and bring the following documents:</p>
                <ul>
                    <li>Valid ID</li>
                    <li>Completed application form</li>
                    <li>Proof of payment</li>
                    <li>Previous passport (if applicable)</li>
                </ul>

                <p>If you need to cancel or reschedule your appointment, please log in to your account or contact our support team.</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; Passport Appointment System</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Plain text email template
    plain_template = f"""
    PASSPORT APPOINTMENT CONFIRMATION

    Dear {user_name},

    Your passport appointment has been successfully booked. Please find the details below:

    Booking Reference: {booking_id}
    Location: {location_name}
    Address: {location_address}
    Date: {date}
    Time: {time}

    Please arrive 15 minutes before your scheduled appointment and bring the following documents:
    - Valid ID
    - Completed application form
    - Proof of payment
    - Previous passport (if applicable)

    If you need to cancel or reschedule your appointment, please log in to your account or contact our support team.

    This is an automated message. Please do not reply to this email.

    Passport Appointment System
    """

    return html_template, plain_template
