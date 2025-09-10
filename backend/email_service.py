"""
Email notification service for new lead alerts
"""
import os
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from typing import Optional

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailNotificationService:
    def __init__(self):
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        self.sender_email = os.getenv('SENDER_EMAIL', 'noreply@grrassolutions.com')
        self.admin_email = os.getenv('ADMIN_EMAIL', 'admin@grrassolutions.com')
        
        if not self.sendgrid_api_key or self.sendgrid_api_key == 'your_sendgrid_api_key_here':
            logger.warning("SendGrid API key not configured. Email notifications will be disabled.")
            self.enabled = False
        else:
            self.enabled = True
            self.sg = SendGridAPIClient(self.sendgrid_api_key)

    def send_new_lead_notification(self, lead_data: dict) -> bool:
        """
        Send email notification to admin when new lead is received
        
        Args:
            lead_data: Dictionary containing lead information
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.enabled:
            logger.info("Email notifications disabled - SendGrid not configured")
            return False
            
        try:
            # Create HTML email content
            html_content = self._create_lead_notification_html(lead_data)
            
            # Create email message
            message = Mail(
                from_email=self.sender_email,
                to_emails=self.admin_email,
                subject=f"🎯 New Lead Alert: {lead_data.get('name', 'Unknown')} - {lead_data.get('course', 'General Inquiry')}",
                html_content=html_content
            )
            
            # Send email
            response = self.sg.send(message)
            
            if response.status_code == 202:
                logger.info(f"New lead notification sent successfully for lead: {lead_data.get('name')}")
                return True
            else:
                logger.error(f"Failed to send email notification. Status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending lead notification email: {str(e)}")
            return False

    def _create_lead_notification_html(self, lead_data: dict) -> str:
        """
        Create HTML content for new lead notification email
        """
        name = lead_data.get('name', 'Unknown')
        email = lead_data.get('email', 'Not provided')
        phone = lead_data.get('phone', 'Not provided')
        course = lead_data.get('course', 'General Inquiry')
        source = lead_data.get('source', 'Website')
        notes = lead_data.get('notes', 'No additional notes')
        timestamp = lead_data.get('timestamp', 'Just now')
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Lead Alert - GRRAS Solutions</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f8f9fa;
                    margin: 0;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }}
                .header {{
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                    font-weight: bold;
                }}
                .alert-icon {{
                    font-size: 48px;
                    margin-bottom: 10px;
                }}
                .content {{
                    padding: 30px;
                }}
                .lead-info {{
                    background-color: #f8f9fa;
                    border-left: 4px solid #f97316;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 5px;
                }}
                .lead-item {{
                    margin-bottom: 15px;
                    padding: 10px 0;
                    border-bottom: 1px solid #e9ecef;
                }}
                .lead-item:last-child {{
                    border-bottom: none;
                }}
                .label {{
                    font-weight: bold;
                    color: #495057;
                    display: inline-block;
                    width: 120px;
                }}
                .value {{
                    color: #212529;
                }}
                .priority {{
                    background-color: #dc3545;
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    display: inline-block;
                    margin-bottom: 20px;
                }}
                .cta {{
                    text-align: center;
                    margin: 30px 0;
                }}
                .cta-button {{
                    background-color: #f97316;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    display: inline-block;
                    transition: background-color 0.3s;
                }}
                .cta-button:hover {{
                    background-color: #ea580c;
                }}
                .footer {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #6c757d;
                    font-size: 14px;
                }}
                .notes {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 15px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="alert-icon">🎯</div>
                    <h1>New Lead Alert!</h1>
                    <p>You have received a new lead inquiry</p>
                </div>
                
                <div class="content">
                    <div class="priority">HIGH PRIORITY</div>
                    
                    <p>Hello Admin,</p>
                    <p>Great news! A new potential student has shown interest in our courses. Here are the details:</p>
                    
                    <div class="lead-info">
                        <div class="lead-item">
                            <span class="label">👤 Name:</span>
                            <span class="value"><strong>{name}</strong></span>
                        </div>
                        <div class="lead-item">
                            <span class="label">📧 Email:</span>
                            <span class="value"><a href="mailto:{email}">{email}</a></span>
                        </div>
                        <div class="lead-item">
                            <span class="label">📱 Phone:</span>
                            <span class="value"><a href="tel:{phone}">{phone}</a></span>
                        </div>
                        <div class="lead-item">
                            <span class="label">🎓 Course:</span>
                            <span class="value"><strong>{course}</strong></span>
                        </div>
                        <div class="lead-item">
                            <span class="label">🌐 Source:</span>
                            <span class="value">{source}</span>
                        </div>
                        <div class="lead-item">
                            <span class="label">⏰ Received:</span>
                            <span class="value">{timestamp}</span>
                        </div>
                    </div>
                    
                    {f'<div class="notes"><strong>📝 Additional Notes:</strong><br>{notes}</div>' if notes and notes != 'No additional notes' else ''}
                    
                    <div class="cta">
                        <a href="https://kube-course-hub.preview.emergentagent.com/admin/leads" class="cta-button">
                            View All Leads →
                        </a>
                    </div>
                    
                    <p><strong>Quick Actions:</strong></p>
                    <ul>
                        <li>📞 <strong>Call immediately</strong> while interest is high</li>
                        <li>📧 Send personalized course information</li>
                        <li>📅 Schedule a course demo or consultation</li>
                        <li>💬 Follow up within 24 hours for best results</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p><strong>GRRAS Solutions Training Institute</strong></p>
                    <p>This is an automated notification from your lead management system.</p>
                    <p>© 2025 GRRAS Solutions. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html_content

    def test_email_configuration(self) -> bool:
        """
        Test if email configuration is working
        """
        if not self.enabled:
            return False
            
        try:
            # Send a test email
            test_lead = {
                'name': 'Test Lead',
                'email': 'test@example.com',
                'phone': '+91-9999999999',
                'course': 'DevOps Training',
                'source': 'Website Test',
                'notes': 'This is a test notification to verify email configuration.',
                'timestamp': 'Just now'
            }
            
            return self.send_new_lead_notification(test_lead)
            
        except Exception as e:
            logger.error(f"Email configuration test failed: {str(e)}")
            return False

# Create global instance
email_service = EmailNotificationService()