import { Test, TestingModule } from '@nestjs/testing';
import { LeadScoringService } from './lead-scoring.service';

describe('LeadScoringService', () => {
  let service: LeadScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadScoringService],
    }).compile();

    service = module.get<LeadScoringService>(LeadScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateScore', () => {
    it('should give high score for high-priority African military inquiry', () => {
      const inquiry = {
        inquiryType: 'sales' as const,
        fullName: 'Colonel Test',
        email: 'test@military.gov',
        country: 'NG',
        company: 'Nigerian Military',
        message: 'We need to purchase 20 units urgently. Budget allocated over $1M for immediate deployment.',
        metadata: {
          budget: '>$1M',
          timeline: 'immediate',
        },
      };

      const score = service.calculateScore(inquiry);

      expect(score).toBeGreaterThan(70); // High priority
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give low score for general inquiry from non-African country', () => {
      const inquiry = {
        inquiryType: 'general' as const,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        country: 'US',
        message: 'Curious about products.',
      };

      const score = service.calculateScore(inquiry);

      expect(score).toBeLessThan(20); // Low priority
    });

    it('should prioritize African countries', () => {
      const africanInquiry = {
        inquiryType: 'general' as const,
        fullName: 'Test',
        email: 'test@example.com',
        country: 'NG', // Nigeria
        message: 'General inquiry',
      };

      const nonAfricanInquiry = {
        ...africanInquiry,
        country: 'US',
      };

      const africanScore = service.calculateScore(africanInquiry);
      const nonAfricanScore = service.calculateScore(nonAfricanInquiry);

      expect(africanScore).toBeGreaterThan(nonAfricanScore);
    });

    it('should prioritize sales over support inquiries', () => {
      const salesInquiry = {
        inquiryType: 'sales' as const,
        fullName: 'Test',
        email: 'test@example.com',
        country: 'NG',
        message: 'Want to buy products',
      };

      const supportInquiry = {
        ...salesInquiry,
        inquiryType: 'support' as const,
      };

      const salesScore = service.calculateScore(salesInquiry);
      const supportScore = service.calculateScore(supportInquiry);

      expect(salesScore).toBeGreaterThan(supportScore);
    });

    it('should boost score for company/organization', () => {
      const withCompany = {
        inquiryType: 'general' as const,
        fullName: 'Test',
        email: 'test@example.com',
        country: 'NG',
        company: 'Test Company',
        message: 'Inquiry',
      };

      const withoutCompany = {
        ...withCompany,
        company: undefined,
      };

      const withCompanyScore = service.calculateScore(withCompany);
      const withoutCompanyScore = service.calculateScore(withoutCompany as any);

      expect(withCompanyScore).toBeGreaterThan(withoutCompanyScore);
    });

    it('should boost score for detailed messages', () => {
      const detailedMessage = {
        inquiryType: 'general' as const,
        fullName: 'Test',
        email: 'test@example.com',
        country: 'NG',
        message: 'This is a very detailed message about our requirements. ' +
                 'We need comprehensive information about your products and services. ' +
                 'We are planning a large-scale procurement process.',
      };

      const shortMessage = {
        ...detailedMessage,
        message: 'Short inquiry',
      };

      const detailedScore = service.calculateScore(detailedMessage);
      const shortScore = service.calculateScore(shortMessage);

      expect(detailedScore).toBeGreaterThan(shortScore);
    });

    it('should detect high-value keywords', () => {
      const withKeywords = {
        inquiryType: 'general' as const,
        fullName: 'Test',
        email: 'test@example.com',
        country: 'NG',
        message: 'We want to purchase defense systems for our military. Budget approved.',
      };

      const withoutKeywords = {
        ...withKeywords,
        message: 'General inquiry about information',
      };

      const withKeywordsScore = service.calculateScore(withKeywords);
      const withoutKeywordsScore = service.calculateScore(withoutKeywords);

      expect(withKeywordsScore).toBeGreaterThan(withoutKeywordsScore);
    });

    it('should cap score at 100', () => {
      const maxInquiry = {
        inquiryType: 'sales' as const,
        fullName: 'Test',
        email: 'test@military.gov',
        country: 'NG',
        company: 'Military Government Ministry',
        message: 'We urgently need to purchase defense systems immediately. ' +
                 'Budget approved over $1M. Procurement contract ready. ' +
                 'Government tender for military air force equipment.',
        metadata: {
          budget: '>$1M',
          timeline: 'immediate',
        },
      };

      const score = service.calculateScore(maxInquiry);

      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('getScoreCategory', () => {
    it('should return "high" for scores >= 70', () => {
      expect(service.getScoreCategory(70)).toBe('high');
      expect(service.getScoreCategory(85)).toBe('high');
      expect(service.getScoreCategory(100)).toBe('high');
    });

    it('should return "medium" for scores 40-69', () => {
      expect(service.getScoreCategory(40)).toBe('medium');
      expect(service.getScoreCategory(55)).toBe('medium');
      expect(service.getScoreCategory(69)).toBe('medium');
    });

    it('should return "low" for scores < 40', () => {
      expect(service.getScoreCategory(0)).toBe('low');
      expect(service.getScoreCategory(20)).toBe('low');
      expect(service.getScoreCategory(39)).toBe('low');
    });
  });
});

