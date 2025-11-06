import { Injectable, BadRequestException } from '@nestjs/common';

export type RfqStatus = 'pending' | 'quoted' | 'won' | 'lost';

@Injectable()
export class RfqWorkflowService {
  /**
   * Valid status transitions
   */
  private readonly validTransitions: Record<RfqStatus, RfqStatus[]> = {
    pending: ['quoted', 'lost'], // Can quote or lose from pending
    quoted: ['won', 'lost'], // Can win or lose from quoted
    won: [], // Terminal state
    lost: [], // Terminal state
  };

  /**
   * Validate if status transition is allowed
   */
  validateTransition(currentStatus: string, newStatus: string): boolean {
    const current = currentStatus as RfqStatus;
    const next = newStatus as RfqStatus;

    if (!this.validTransitions[current]) {
      return false;
    }

    return this.validTransitions[current].includes(next);
  }

  /**
   * Get allowed next statuses for current status
   */
  getAllowedStatuses(currentStatus: string): RfqStatus[] {
    return this.validTransitions[currentStatus as RfqStatus] || [];
  }

  /**
   * Check if status is terminal (no further transitions)
   */
  isTerminalStatus(status: string): boolean {
    const rfqStatus = status as RfqStatus;
    return this.validTransitions[rfqStatus]?.length === 0;
  }

  /**
   * Validate status update and throw error if invalid
   */
  ensureValidTransition(currentStatus: string, newStatus: string): void {
    if (currentStatus === newStatus) {
      return; // No change is always valid
    }

    if (!this.validateTransition(currentStatus, newStatus)) {
      const allowed = this.getAllowedStatuses(currentStatus);
      throw new BadRequestException(
        `Invalid status transition from "${currentStatus}" to "${newStatus}". ` +
          `Allowed transitions: ${allowed.length > 0 ? allowed.join(', ') : 'none (terminal state)'}`,
      );
    }
  }

  /**
   * Get status workflow description
   */
  getWorkflowDescription(): string {
    return `
RFQ Status Workflow:
  pending → quoted (send quote to customer)
  pending → lost (customer not interested)
  quoted → won (customer accepts quote)
  quoted → lost (customer rejects quote)
  won → [terminal]
  lost → [terminal]
    `.trim();
  }
}

