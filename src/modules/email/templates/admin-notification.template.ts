export interface AdminNotificationData {
  fullName: string;
  email: string;
  company?: string;
  country: string;
  inquiryType: string;
  leadScore: number;
  message: string;
  inquiryId: string;
}

export const adminNotificationTemplate = (data: AdminNotificationData) => ({
  subject: `🔔 New ${data.leadScore >= 70 ? 'HIGH PRIORITY' : ''} Inquiry from ${data.country}`,
  
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${data.leadScore >= 70 ? '#dc2626' : '#4a90e2'}; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .info-row { margin: 10px 0; padding: 10px; background: #fff; border-left: 3px solid #4a90e2; }
    .label { font-weight: bold; color: #666; }
    .score { font-size: 24px; font-weight: bold; color: ${data.leadScore >= 70 ? '#dc2626' : data.leadScore >= 40 ? '#f59e0b' : '#10b981'}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.leadScore >= 70 ? '🚨 HIGH PRIORITY INQUIRY' : 'New Inquiry'}</h1>
      <p>Lead Score: <span class="score">${data.leadScore}/100</span></p>
    </div>
    
    <div class="content">
      <h2>New ${data.inquiryType} Inquiry</h2>
      
      <div class="info-row">
        <span class="label">From:</span> ${data.fullName} (${data.email})
      </div>
      
      ${data.company ? `
      <div class="info-row">
        <span class="label">Company:</span> ${data.company}
      </div>
      ` : ''}
      
      <div class="info-row">
        <span class="label">Country:</span> ${data.country}
      </div>
      
      <div class="info-row">
        <span class="label">Type:</span> ${data.inquiryType}
      </div>
      
      <div class="info-row">
        <span class="label">Lead Score:</span> ${data.leadScore}/100 (${data.leadScore >= 70 ? 'HIGH' : data.leadScore >= 40 ? 'MEDIUM' : 'LOW'} Priority)
      </div>
      
      <div class="info-row">
        <span class="label">Message:</span><br>${data.message}
      </div>
      
      <p style="margin-top: 30px;">
        <strong>Inquiry ID:</strong> ${data.inquiryId}<br>
        <strong>Action Required:</strong> ${data.leadScore >= 70 ? 'Respond within 4 hours' : data.leadScore >= 40 ? 'Respond within 24 hours' : 'Respond within 48 hours'}
      </p>
      
      <p><a href="http://localhost:4000/api/v1/inquiries/${data.inquiryId}" style="color: #4a90e2;">View in Admin Dashboard →</a></p>
    </div>
  </div>
</body>
</html>
  `,
  
  text: `
NEW ${data.leadScore >= 70 ? 'HIGH PRIORITY' : ''} INQUIRY

Lead Score: ${data.leadScore}/100 (${data.leadScore >= 70 ? 'HIGH' : data.leadScore >= 40 ? 'MEDIUM' : 'LOW'} Priority)

Type: ${data.inquiryType}
From: ${data.fullName} (${data.email})
${data.company ? `Company: ${data.company}\n` : ''}Country: ${data.country}

Message:
${data.message}

---
Inquiry ID: ${data.inquiryId}
Action Required: ${data.leadScore >= 70 ? 'Respond within 4 hours' : data.leadScore >= 40 ? 'Respond within 24 hours' : 'Respond within 48 hours'}

View in Admin Dashboard: http://localhost:4000/api/v1/inquiries/${data.inquiryId}
  `.trim(),
});

