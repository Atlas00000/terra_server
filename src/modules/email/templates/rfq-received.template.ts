export interface RfqReceivedData {
  fullName: string;
  productCategory: string;
  quantity?: number;
  rfqId: string;
}

export const rfqReceivedTemplate = (data: RfqReceivedData) => ({
  subject: 'Your RFQ Has Been Received - Terra Industries',
  
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TERRA INDUSTRIES</h1>
    </div>
    
    <div class="content">
      <h2>RFQ Received</h2>
      
      <p>Dear ${data.fullName},</p>
      
      <p>Thank you for your Request for Quote (RFQ) for <strong>${data.productCategory.toUpperCase()}</strong>${data.quantity ? ` (${data.quantity} units)` : ''}.</p>
      
      <p><strong>RFQ Reference:</strong> ${data.rfqId}</p>
      
      <p>Our sales team is preparing a detailed quote for you. We will send you a comprehensive proposal within 48-72 hours including:</p>
      
      <ul>
        <li>Pricing breakdown</li>
        <li>Technical specifications</li>
        <li>Delivery timeline</li>
        <li>Training and support options</li>
      </ul>
      
      <p>If you have any questions in the meantime, please don't hesitate to reach out.</p>
      
      <p>Best regards,<br>
      <strong>Terra Industries Sales Team</strong></p>
    </div>
  </div>
</body>
</html>
  `,
  
  text: `
RFQ Received - Terra Industries

Dear ${data.fullName},

Thank you for your Request for Quote (RFQ) for ${data.productCategory.toUpperCase()}${data.quantity ? ` (${data.quantity} units)` : ''}.

RFQ Reference: ${data.rfqId}

Our sales team is preparing a detailed quote for you. We will send you a comprehensive proposal within 48-72 hours including:

- Pricing breakdown
- Technical specifications  
- Delivery timeline
- Training and support options

If you have any questions in the meantime, please don't hesitate to reach out.

Best regards,
Terra Industries Sales Team
  `.trim(),
});

