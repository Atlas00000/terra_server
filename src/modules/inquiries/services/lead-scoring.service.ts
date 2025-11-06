import { Injectable } from '@nestjs/common';
import { CreateInquiryDto } from '../dto/create-inquiry.dto';

@Injectable()
export class LeadScoringService {
  /**
   * Calculate lead score based on inquiry data
   * Score range: 0-100 (higher = more priority)
   */
  calculateScore(inquiry: CreateInquiryDto): number {
    let score = 0;

    // 1. Country Scoring (Priority: African countries)
    const highPriorityCountries = ['NG', 'ZA', 'KE', 'GH', 'EG', 'TZ', 'UG', 'ET'];
    if (highPriorityCountries.includes(inquiry.country.toUpperCase())) {
      score += 15;
    } else if (inquiry.country.match(/^[A-Z]{2}$/)) {
      // Other African countries (rough check)
      score += 5;
    }

    // 2. Inquiry Type Scoring
    if (inquiry.inquiryType === 'sales') {
      score += 20;
    } else if (inquiry.inquiryType === 'partnership') {
      score += 15;
    } else if (inquiry.inquiryType === 'support') {
      score += 10;
    } else {
      score += 5; // general
    }

    // 3. Company/Organization (Business inquiry)
    if (inquiry.company && inquiry.company.length > 0) {
      score += 10;
    }

    // 4. Message Length (Detailed inquiry = more serious)
    if (inquiry.message.length > 200) {
      score += 10;
    } else if (inquiry.message.length > 100) {
      score += 5;
    }

    // 5. Keywords Analysis (High-value indicators)
    const message = inquiry.message.toLowerCase();
    const company = (inquiry.company || '').toLowerCase();

    const highValueKeywords = [
      'purchase', 'buy', 'budget', 'quote', 'contract', 'procurement',
      'ministry', 'government', 'military', 'defense', 'army', 'air force',
      'urgent', 'immediate', 'asap', 'tender', 'rfp', 'rfq'
    ];

    const matchedKeywords = highValueKeywords.filter(keyword =>
      message.includes(keyword) || company.includes(keyword)
    );

    score += Math.min(matchedKeywords.length * 5, 20); // Max 20 points from keywords

    // 6. Budget Indicators (from metadata)
    if (inquiry.metadata?.budget) {
      const budget = inquiry.metadata.budget.toLowerCase();
      if (budget.includes('>$1m') || budget.includes('million')) {
        score += 15;
      } else if (budget.includes('$500k') || budget.includes('500000')) {
        score += 10;
      } else if (budget.includes('$100k') || budget.includes('100000')) {
        score += 5;
      }
    }

    // 7. Timeline Urgency (from metadata)
    if (inquiry.metadata?.timeline) {
      const timeline = inquiry.metadata.timeline.toLowerCase();
      if (timeline.includes('immediate') || timeline.includes('urgent')) {
        score += 15;
      } else if (timeline.includes('3') || timeline.includes('6')) {
        score += 10; // 3-6 months
      }
    }

    // Cap score at 100
    return Math.min(score, 100);
  }

  /**
   * Get score category for display
   */
  getScoreCategory(score: number): string {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  /**
   * Get score description
   */
  getScoreDescription(score: number): string {
    if (score >= 70) return 'High priority - respond within 4 hours';
    if (score >= 40) return 'Medium priority - respond within 24 hours';
    return 'Low priority - respond within 48 hours';
  }
}

