export interface QuoteSentData {
  fullName: string;
  productCategory: string;
  quantity?: number;
  quoteAmount: number;
  rfqId: string;
  notes?: string;
  specifications?: Record<string, any>;
}

export const quoteSentTemplate = (data: QuoteSentData) => ({
  subject: `Your Quote from Terra Industries - ${data.productCategory.toUpperCase()} (${formatCurrency(data.quoteAmount)})`,
  
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
    .quote-box { background: #fff; border: 2px solid #4a90e2; padding: 20px; margin: 20px 0; text-align: center; }
    .amount { font-size: 32px; font-weight: bold; color: #4a90e2; }
    .specs { background: #fff; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TERRA INDUSTRIES</h1>
      <p>Your Official Quote</p>
    </div>
    
    <div class="content">
      <h2>Quote for ${data.fullName}</h2>
      
      <p>We are pleased to present our quote for <strong>${data.productCategory.toUpperCase()}</strong>${data.quantity ? ` (${data.quantity} units)` : ''}.</p>
      
      <div class="quote-box">
        <p>TOTAL QUOTE AMOUNT</p>
        <div class="amount">${formatCurrency(data.quoteAmount)}</div>
        <p style="color: #666; font-size: 14px;">RFQ Reference: ${data.rfqId}</p>
      </div>
      
      ${data.notes ? `
      <div class="specs">
        <h3>Quote Details:</h3>
        <p>${data.notes}</p>
      </div>
      ` : ''}
      
      ${data.specifications ? `
      <div class="specs">
        <h3>Specifications:</h3>
        <ul>
          ${Object.entries(data.specifications).map(([key, value]) => `
            <li><strong>${key}:</strong> ${value}</li>
          `).join('')}
        </ul>
      </div>
      ` : ''}
      
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Review the quote details above</li>
        <li>Contact us if you have any questions</li>
        <li>Let us know your decision when ready</li>
      </ul>
      
      <p>This quote is valid for 30 days from the date of issue.</p>
      
      <p>Best regards,<br>
      <strong>Terra Industries Sales Team</strong></p>
    </div>
  </div>
</body>
</html>
  `,
  
  text: `
TERRA INDUSTRIES - OFFICIAL QUOTE

Dear ${data.fullName},

We are pleased to present our quote for ${data.productCategory.toUpperCase()}${data.quantity ? ` (${data.quantity} units)` : ''}.

TOTAL QUOTE AMOUNT: ${formatCurrency(data.quoteAmount)}
RFQ Reference: ${data.rfqId}

${data.notes ? `\nQuote Details:\n${data.notes}\n` : ''}

${data.specifications ? `\nSpecifications:\n${Object.entries(data.specifications).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n` : ''}

Next Steps:
- Review the quote details above
- Contact us if you have any questions
- Let us know your decision when ready

This quote is valid for 30 days from the date of issue.

Best regards,
Terra Industries Sales Team
  `.trim(),
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

