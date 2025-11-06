export interface InquiryConfirmationData {
  fullName: string;
  inquiryId: string;
  inquiryType: string;
}

export const inquiryConfirmationTemplate = (data: InquiryConfirmationData) => ({
  subject: 'Thank You for Contacting Terra Industries',
  
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #000; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 30px; background: #4a90e2; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TERRA INDUSTRIES</h1>
      <p>Advanced Defense Technology & Aerospace Solutions</p>
    </div>
    
    <div class="content">
      <h2>Thank You, ${data.fullName}</h2>
      
      <p>We have received your ${data.inquiryType} inquiry and appreciate your interest in Terra Industries.</p>
      
      <p><strong>Inquiry Reference:</strong> ${data.inquiryId}</p>
      
      <p>Our team will review your request and respond within <strong>24 hours</strong>. For urgent matters, please contact our sales team directly.</p>
      
      <p>We look forward to working with you.</p>
      
      <p>Best regards,<br>
      <strong>Terra Industries Team</strong></p>
    </div>
    
    <div class="footer">
      <p>Terra Industries | Advanced Defense Technology<br>
      Email: contact@terraindustries.com | Web: terraindustries.com</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `,
  
  text: `
Thank You for Contacting Terra Industries

Dear ${data.fullName},

We have received your ${data.inquiryType} inquiry and appreciate your interest in Terra Industries.

Inquiry Reference: ${data.inquiryId}

Our team will review your request and respond within 24 hours. For urgent matters, please contact our sales team directly.

We look forward to working with you.

Best regards,
Terra Industries Team

---
Terra Industries | Advanced Defense Technology
Email: contact@terraindustries.com | Web: terraindustries.com
This is an automated message. Please do not reply to this email.
  `.trim(),
});

