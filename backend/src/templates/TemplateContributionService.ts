import { v4 as generateUUID } from 'uuid';

export interface Template {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  triggers: TemplateTrigger[];
  steps: TemplateStep[];
}

export interface TemplateTrigger {
  type: string;
  events?: string[];
  cron?: string;
  description?: string;
}

export interface TemplateStep {
  id: string;
  action: string;
  config: Record<string, any>;
}

export interface TemplateContribution {
  contributorId: string;
  template: Template;
  description: string;
  useCase: string;
  expectedImpact: string;
}

export interface TemplateSubmission {
  id: string;
  contributorId: string;
  template: Template;
  status: 'pending_review' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewQueue: string;
  metadata: {
    description: string;
    useCase: string;
    expectedImpact: string;
  };
  review?: TemplateReview;
}

export interface TemplateReview {
  reviewerId: string;
  reviewedAt: Date;
  feedback: string;
  approved: boolean;
  suggestedChanges?: string[];
}

export interface TemplateValidation {
  isValid: boolean;
  errors: string[];
}

export class TemplateContributionService {
  async submitTemplate(contribution: TemplateContribution): Promise<TemplateSubmission> {
    // Validate template structure
    const validation = await this.validateTemplate(contribution.template);
    if (!validation.isValid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    // Security scan for custom actions
    const securityScan = await this.securityScan(contribution.template);
    if (securityScan.riskLevel === 'high') {
      throw new Error('Template contains potentially unsafe actions');
    }

    // Create submission record
    const submission: TemplateSubmission = {
      id: generateUUID(),
      contributorId: contribution.contributorId,
      template: contribution.template,
      status: 'pending_review',
      submittedAt: new Date(),
      reviewQueue: this.getReviewQueue(contribution.template.category),
      metadata: {
        description: contribution.description,
        useCase: contribution.useCase,
        expectedImpact: contribution.expectedImpact
      }
    };

    await this.saveSubmission(submission);
    
    // Notify review team
    await this.notifyReviewers(submission);
    
    return submission;
  }

  async reviewTemplate(submissionId: string, review: TemplateReview): Promise<void> {
    const submission = await this.getSubmission(submissionId);
    
    // Update submission status
    submission.status = review.approved ? 'approved' : 'rejected';
    submission.review = {
      reviewerId: review.reviewerId,
      reviewedAt: new Date(),
      feedback: review.feedback,
      approved: review.approved,
      suggestedChanges: review.suggestedChanges
    };

    await this.updateSubmission(submission);

    if (review.approved) {
      // Add to marketplace
      await this.publishToMarketplace(submission.template, submission);
      
      // Notify contributor
      await this.notifyContributor(submission.contributorId, 'approved');
    } else {
      // Notify contributor of rejection with feedback
      await this.notifyContributor(submission.contributorId, 'rejected', review.feedback);
    }
  }

  private async validateTemplate(template: Template): Promise<TemplateValidation> {
    const errors: string[] = [];
    
    // Validate required fields
    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.triggers || template.triggers.length === 0) {
      errors.push('At least one trigger is required');
    }
    if (!template.steps || template.steps.length === 0) {
      errors.push('At least one step is required');
    }

    // Validate step references
    for (const step of template.steps) {
      if (!step.action) {
        errors.push(`Step ${step.id} is missing action`);
      }
      
      // Validate action exists
      if (!this.isValidAction(step.action)) {
        errors.push(`Invalid action: ${step.action} in step ${step.id}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async securityScan(template: Template): Promise<{ riskLevel: 'low' | 'medium' | 'high' }> {
    // Mock security scan - would check for dangerous actions
    const dangerousActions = ['eval', 'exec', 'system', 'shell'];
    
    for (const step of template.steps) {
      if (dangerousActions.some(action => step.action.includes(action))) {
        return { riskLevel: 'high' };
      }
    }
    
    return { riskLevel: 'low' };
  }

  private isValidAction(action: string): boolean {
    // Mock validation - would check against allowed actions
    const allowedActions = [
      'send_email', 'send_sms', 'create_payment_plan', 'sync_to_crm',
      'predict_churn_probability', 'segment_by_risk', 'calculate_cart_metrics',
      'collect_dispute_evidence', 'file_dispute_response', 'adjust_risk_scores'
    ];
    
    return allowedActions.includes(action);
  }

  private getReviewQueue(category: string): string {
    // Assign review queue based on category
    const queueMap: Record<string, string> = {
      'subscriptions': 'payments-team',
      'ecommerce': 'retail-team',
      'risk': 'security-team',
      'default': 'general-team'
    };
    
    return queueMap[category] || queueMap.default;
  }

  private async saveSubmission(submission: TemplateSubmission): Promise<void> {
    // Mock implementation - would save to database
    console.log('Saving template submission:', submission.id);
  }

  private async getSubmission(submissionId: string): Promise<TemplateSubmission> {
    // Mock implementation - would query database
    return {
      id: submissionId,
      contributorId: 'user-123',
      template: {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        version: '1.0.0',
        category: 'subscriptions',
        triggers: [{ type: 'stripe_webhook', events: ['invoice.payment_failed'] }],
        steps: [{ id: 'step1', action: 'send_email', config: {} }]
      },
      status: 'pending_review',
      submittedAt: new Date(),
      reviewQueue: 'payments-team',
      metadata: {
        description: 'Test description',
        useCase: 'Test use case',
        expectedImpact: 'Test impact'
      }
    };
  }

  private async updateSubmission(submission: TemplateSubmission): Promise<void> {
    // Mock implementation - would update database
    console.log('Updating template submission:', submission.id);
  }

  private async publishToMarketplace(template: Template, submission: TemplateSubmission): Promise<void> {
    // Mock implementation - would add to marketplace
    console.log('Publishing template to marketplace:', template.id);
  }

  private async notifyReviewers(submission: TemplateSubmission): Promise<void> {
    // Mock implementation - would send notifications
    console.log('Notifying reviewers for submission:', submission.id);
  }

  private async notifyContributor(
    contributorId: string, 
    status: 'approved' | 'rejected', 
    feedback?: string
  ): Promise<void> {
    // Mock implementation - would send notification
    console.log(`Notifying contributor ${contributorId} of ${status} status`);
    if (feedback) {
      console.log('Feedback:', feedback);
    }
  }
}
