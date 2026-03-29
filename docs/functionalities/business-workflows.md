# Business Workflow Templates

## Overview
Torqvio provides pre-built workflow templates for common business processes, enabling rapid deployment and proven patterns for automation across various business functions.

## Payment Processing Workflows

### 1. Subscription Billing Workflow
**Purpose**: Automated subscription billing with retry logic and dunning management

#### Workflow Steps
```typescript
interface SubscriptionBillingWorkflow {
  triggers: {
    type: 'cron';
    schedule: '0 0 1 * *';  // Monthly on 1st day
    timezone: 'UTC';
  };
  
  steps: [
    {
      name: 'get-active-subscriptions';
      type: 'database';
      query: 'SELECT * FROM subscriptions WHERE status = "active"';
    },
    {
      name: 'process-payment';
      type: 'http';
      url: 'https://api.stripe.com/v1/charges';
      method: 'POST';
      retryPolicy: {
        maxAttempts: 3;
        backoffStrategy: 'exponential';
      };
    },
    {
      name: 'handle-payment-result';
      type: 'function';
      code: `
        if (payment.status === 'succeeded') {
          updateSubscriptionStatus(subscriptionId, 'active');
          sendPaymentConfirmation(customerId, amount);
        } else {
          handlePaymentFailure(subscriptionId, payment.error);
        }
      `;
    },
    {
      name: 'send-dunning-notice';
      type: 'email';
      condition: 'payment.status === "failed"';
      template: 'dunning-notice';
    },
    {
      name: 'update-subscription-status';
      type: 'database';
      condition: 'retryAttempts >= 3';
      query: 'UPDATE subscriptions SET status = "cancelled" WHERE id = ?';
    }
  ];
}
```

#### Business Logic
- **Retry Strategy**: 3 payment retries with exponential backoff
- **Dunning Management**: Automated payment failure notifications
- **Subscription Management**: Automatic status updates and cancellations
- **Customer Communication**: Payment confirmations and failure notices

#### Use Cases
- **SaaS Companies**: Monthly subscription billing
- **Service Providers**: Recurring service charges
- **Membership Organizations**: Membership fee processing
- **Content Platforms**: Premium content subscriptions

### 2. Invoice Processing Workflow
**Purpose**: Automated invoice creation, sending, and payment tracking

#### Workflow Steps
```typescript
interface InvoiceProcessingWorkflow {
  triggers: {
    type: 'webhook';
    events: ['order.completed', 'service.delivered'];
  };
  
  steps: [
    {
      name: 'generate-invoice';
      type: 'function';
      code: `
        const invoice = createInvoice(orderData);
        const pdf = generateInvoicePDF(invoice);
        return { invoice, pdf };
      `;
    },
    {
      name: 'save-invoice';
      type: 'database';
      operation: 'insert';
      table: 'invoices';
    },
    {
      name: 'send-invoice-email';
      type: 'email';
      template: 'invoice-template';
      attachments: ['pdf'];
    },
    {
      name: 'schedule-payment-reminder';
      type: 'delay';
      duration: 864000000;  // 10 days in milliseconds
    },
    {
      name: 'send-payment-reminder';
      type: 'email';
      condition: 'invoice.status === "unpaid"';
      template: 'payment-reminder';
    },
    {
      name: 'check-payment-status';
      type: 'http';
      url: 'https://api.stripe.com/v1/charges';
      method: 'GET';
    }
  ];
}
```

#### Business Logic
- **Invoice Generation**: Automatic invoice creation from orders
- **PDF Generation**: Professional invoice PDF creation
- **Email Delivery**: Automated invoice sending
- **Payment Tracking**: Monitor payment status and send reminders

#### Use Cases
- **E-commerce**: Order invoicing and payment collection
- **Professional Services**: Service billing and invoicing
- **Consulting**: Project-based invoicing
- **Freelancers**: Client invoicing and payment tracking

### 3. Refund Processing Workflow
**Purpose**: Automated refund processing with approval workflow

#### Workflow Steps
```typescript
interface RefundProcessingWorkflow {
  triggers: {
    type: 'webhook';
    events: ['refund.requested'];
  };
  
  steps: [
    {
      name: 'validate-refund-request';
      type: 'function';
      code: `
        const isValid = validateRefundPolicy(request);
        const amount = calculateRefundAmount(order);
        return { isValid, amount };
      `;
    },
    {
      name: 'manager-approval';
      type: 'approval';
      condition: 'amount > 100';
      approvers: ['finance-manager@company.com'];
      timeout: 86400000;  // 24 hours
    },
    {
      name: 'process-refund';
      type: 'http';
      url: 'https://api.stripe.com/v1/refunds';
      method: 'POST';
      body: {
        charge: '{{originalChargeId}}',
        amount: '{{refundAmount}}'
      };
    },
    {
      name: 'update-order-status';
      type: 'database';
      operation: 'update';
      table: 'orders';
      data: { status: 'refunded' };
    },
    {
      name: 'send-refund-confirmation';
      type: 'email';
      template: 'refund-confirmation';
    }
  ];
}
```

#### Business Logic
- **Policy Validation**: Check refund eligibility and amount
- **Approval Workflow**: Manager approval for large refunds
- **Refund Processing**: Automated refund execution
- **Customer Communication**: Refund confirmation notifications

#### Use Cases
- **E-commerce**: Product returns and refunds
- **Service Providers**: Service refunds and credits
- **Software Companies**: Subscription refunds and cancellations
- **Retail**: Purchase returns and exchanges

## User Onboarding Workflows

### 1. Welcome Sequence Workflow
**Purpose**: Automated user onboarding with progressive feature introduction

#### Workflow Steps
```typescript
interface WelcomeSequenceWorkflow {
  triggers: {
    type: 'webhook';
    events: ['user.registered'];
  };
  
  steps: [
    {
      name: 'create-user-profile';
      type: 'database';
      operation: 'insert';
      table: 'user_profiles';
    },
    {
      name: 'send-welcome-email';
      type: 'email';
      template: 'welcome-email';
      delay: 0;  // Immediate
    },
    {
      name: 'setup-progress-tracking';
      type: 'database';
      operation: 'insert';
      table: 'onboarding_progress';
      data: { completed_steps: 0, total_steps: 5 };
    },
    {
      name: 'day-2-feature-intro';
      type: 'email';
      template: 'day-2-features';
      delay: 172800000;  // 2 days
    },
    {
      name: 'day-5-best-practices';
      type: 'email';
      template: 'day-5-best-practices';
      delay: 432000000;  // 5 days
    },
    {
      name: 'day-7-advanced-features';
      type: 'email';
      template: 'day-7-advanced-features';
      delay: 604800000;  // 7 days
    },
    {
      name: 'day-14-check-in';
      type: 'email';
      template: 'day-14-check-in';
      delay: 1209600000;  // 14 days
    }
  ];
}
```

#### Business Logic
- **Progressive Disclosure**: Introduce features gradually
- **Timing Optimization**: Strategic email timing for engagement
- **Progress Tracking**: Monitor onboarding completion
- **Personalization**: Tailored content based on user behavior

#### Use Cases
- **SaaS Products**: User onboarding and feature adoption
- **Mobile Apps**: User engagement and retention
- **Online Platforms**: New user orientation
- **Community Sites**: Member onboarding and engagement

### 2. Trial Conversion Workflow
**Purpose**: Convert trial users to paid subscriptions through targeted engagement

#### Workflow Steps
```typescript
interface TrialConversionWorkflow {
  triggers: {
    type: 'webhook';
    events: ['trial.started'];
  };
  
  steps: [
    {
      name: 'schedule-trial-reminders';
      type: 'function';
      code: `
        const reminders = [
          { days: 3, template: 'trial-day-3' },
          { days: 7, template: 'trial-day-7' },
          { days: 14, template: 'trial-day-14' },
          { days: 21, template: 'trial-day-21' },
          { days: 25, template: 'trial-day-25' },
          { days: 28, template: 'trial-expiring' }
        ];
        return reminders;
      `;
    },
    {
      name: 'track-user-activity';
      type: 'function';
      code: `
        const activity = getUserActivity(userId);
        const engagement = calculateEngagementScore(activity);
        updateEngagementMetrics(userId, engagement);
        return { activity, engagement };
      `;
    },
    {
      name: 'send-personalized-reminder';
      type: 'email';
      template: '{{reminder.template}}';
      condition: 'engagement.score > 0.3';
    },
    {
      name: 'offer-conversion-incentive';
      type: 'email';
      condition: 'trial.daysRemaining <= 7 && engagement.score > 0.5';
      template: 'conversion-incentive';
    },
    {
      name: 'handle-trial-expiration';
      type: 'function';
      condition: 'trial.daysRemaining <= 0';
      code: `
        if (engagement.score > 0.7) {
          sendExtendedTrialOffer(userId);
        } else {
          handleTrialExpiration(userId);
        }
      `;
    }
  ];
}
```

#### Business Logic
- **Activity Tracking**: Monitor user engagement during trial
- **Personalized Messaging**: Tailored content based on usage
- **Conversion Incentives**: Special offers for engaged users
- **Graceful Expiration**: Handle trial end with upsell opportunities

#### Use Cases
- **SaaS Companies**: Trial user conversion
- **Service Platforms**: Free tier to paid conversion
- **Software Products**: Feature-limited to full version
- **Online Tools**: Basic to premium feature upgrades

## Email Campaign Workflows

### 1. Drip Campaign Workflow
**Purpose**: Automated email drip campaigns with behavior-based triggers

#### Workflow Steps
```typescript
interface DripCampaignWorkflow {
  triggers: {
    type: 'webhook';
    events: ['campaign.started'];
  };
  
  steps: [
    {
      name: 'segment-audience';
      type: 'function';
      code: `
        const segment = segmentUsers(campaign.criteria);
        return { users: segment, count: segment.length };
      `;
    },
    {
      name: 'send-campaign-email';
      type: 'email';
      template: '{{campaign.emailTemplate}}';
      batch: true;
      batchSize: 1000;
    },
    {
      name: 'track-email-metrics';
      type: 'function';
      code: `
        const metrics = trackEmailPerformance(emailId);
        updateCampaignMetrics(campaignId, metrics);
        return metrics;
      `;
    },
    {
      name: 'schedule-next-email';
      type: 'delay';
      condition: 'campaign.sequence.length > currentStep + 1';
      duration: '{{campaign.delayBetweenEmails}}';
    },
    {
      name: 'trigger-next-email';
      type: 'webhook';
      url: '/api/v1/campaigns/{{campaignId}}/next';
      method: 'POST';
    }
  ];
}
```

#### Business Logic
- **Audience Segmentation**: Target specific user segments
- **Batch Processing**: Handle large email lists efficiently
- **Performance Tracking**: Monitor email metrics and engagement
- **Sequence Management**: Automated email sequence progression

#### Use Cases
- **Marketing Teams**: Automated email marketing campaigns
- **Sales Teams**: Lead nurturing sequences
- **Content Marketing**: Educational email series
- **Product Marketing**: Feature announcement campaigns

### 2. Behavioral Email Workflow
**Purpose**: Triggered emails based on user behavior and actions

#### Workflow Steps
```typescript
interface BehavioralEmailWorkflow {
  triggers: {
    type: 'webhook';
    events: ['user.action'];
  };
  
  steps: [
    {
      name: 'analyze-user-behavior';
      type: 'function';
      code: `
        const behavior = analyzeUserAction(event);
        const intent = predictUserIntent(behavior);
        const segment = segmentByBehavior(behavior);
        return { behavior, intent, segment };
      `;
    },
    {
      name: 'select-email-template';
      type: 'function';
      code: `
        const template = selectTemplateByBehavior(intent, segment);
        const personalization = personalizeContent(userId, template);
        return { template, personalization };
      `;
    },
    {
      name: 'send-behavioral-email';
      type: 'email';
      template: '{{template.id}}';
      personalization: '{{personalization}}';
    },
    {
      name: 'track-engagement';
      type: 'function';
      code: `
        const engagement = trackEmailEngagement(emailId);
        updateUserBehaviorProfile(userId, engagement);
        return engagement;
      `;
    },
    {
      name: 'update-ml-model';
      type: 'function';
      condition: 'engagement.score > 0.8';
      code: `
        updateBehavioralMLModel(userId, behavior, engagement);
      `;
    }
  ];
}
```

#### Business Logic
- **Behavior Analysis**: Understand user actions and intent
- **Dynamic Content**: Personalized email content based on behavior
- **ML Learning**: Improve targeting through machine learning
- **Engagement Tracking**: Monitor and optimize email performance

#### Use Cases
- **E-commerce**: Abandoned cart recovery, browse abandonment
- **Content Platforms**: Content recommendation emails
- **SaaS Products**: Feature adoption and usage tips
- **Online Communities**: Community engagement and participation

## Data Pipeline Workflows

### 1. ETL Pipeline Workflow
**Purpose**: Automated data extraction, transformation, and loading

#### Workflow Steps
```typescript
interface ETLPipelineWorkflow {
  triggers: {
    type: 'cron';
    schedule: '0 2 * * *';  // Daily at 2 AM
    timezone: 'UTC';
  };
  
  steps: [
    {
      name: 'extract-source-data';
      type: 'http';
      url: '{{source.endpoint}}';
      method: 'GET';
      authentication: {
        type: 'api-key';
        key: '{{source.apiKey}}';
      };
    },
    {
      name: 'validate-data';
      type: 'function';
      code: `
        const validation = validateDataSchema(rawData, schema);
        const quality = assessDataQuality(rawData);
        return { validation, quality, data: rawData };
      `;
    },
    {
      name: 'transform-data';
      type: 'function';
      code: `
        const transformed = transformData(data, transformationRules);
        const enriched = enrichData(transformed, enrichmentData);
        const cleaned = cleanData(enriched, cleaningRules);
        return cleaned;
      `;
    },
    {
      name: 'load-to-warehouse';
      type: 'database';
      operation: 'bulk-insert';
      table: '{{target.table}}';
      batchSize: 10000;
    },
    {
      name: 'update-metadata';
      type: 'database';
      operation: 'update';
      table: 'pipeline_metadata';
      data: {
        lastRun: new Date(),
        recordsProcessed: '{{data.length}}',
        status: 'completed'
      };
    },
    {
      name: 'send-completion-notification';
      type: 'email';
      condition: 'validation.errors > 0 || quality.score < 0.9';
      template: 'pipeline-alert';
    }
  ];
}
```

#### Business Logic
- **Data Validation**: Ensure data quality and schema compliance
- **Data Transformation**: Apply business rules and transformations
- **Bulk Processing**: Handle large datasets efficiently
- **Quality Monitoring**: Track data quality and pipeline health

#### Use Cases
- **Business Intelligence**: Data warehouse population
- **Analytics Platforms**: Data aggregation and processing
- **Reporting Systems**: Automated report data preparation
- **Data Migration**: System data migration and synchronization

### 2. Real-time Data Sync Workflow
**Purpose**: Real-time data synchronization between systems

#### Workflow Steps
```typescript
interface RealtimeDataSyncWorkflow {
  triggers: {
    type: 'webhook';
    events: ['data.changed'];
  };
  
  steps: [
    {
      name: 'identify-changed-records';
      type: 'function';
      code: `
        const changes = identifyChanges(event.data);
        const conflicts = detectConflicts(changes);
        return { changes, conflicts };
      `;
    },
    {
      name: 'resolve-conflicts';
      type: 'function';
      condition: 'conflicts.length > 0';
      code: `
        const resolution = resolveDataConflicts(conflicts, conflictRules);
        return resolution;
      `;
    },
    {
      name: 'sync-to-target-systems';
      type: 'parallel';
      branches: [
        {
          name: 'sync-to-primary';
          type: 'http';
          url: '{{primarySystem.endpoint}}';
          method: 'PUT';
        },
        {
          name: 'sync-to-backup';
          type: 'http';
          url: '{{backupSystem.endpoint}}';
          method: 'PUT';
        },
        {
          name: 'sync-to-analytics';
          type: 'http';
          url: '{{analyticsSystem.endpoint}}';
          method: 'POST';
        }
      ];
    },
    {
      name: 'verify-sync';
      type: 'function';
      code: `
        const verification = verifyDataConsistency(changes);
        const failed = verification.filter(v => !v.success);
        return { verification, failed };
      `;
    },
    {
      name: 'handle-sync-failures';
      type: 'function';
      condition: 'failed.length > 0';
      code: `
        const retry = scheduleRetry(failed);
        const alert = sendSyncAlert(failed);
        return { retry, alert };
      `;
    }
  ];
}
```

#### Business Logic
- **Change Detection**: Identify and prioritize data changes
- **Conflict Resolution**: Handle data conflicts automatically
- **Multi-system Sync**: Synchronize across multiple systems
- **Consistency Verification**: Ensure data integrity

#### Use Cases
- **Multi-system Environments**: Keep systems synchronized
- **Microservices**: Data consistency across services
- **Cloud Migration**: Real-time data migration
- **Disaster Recovery**: Real-time backup synchronization

## Scheduled Report Workflows

### 1. Automated Report Generation
**Purpose**: Scheduled report generation and distribution

#### Workflow Steps
```typescript
interface AutomatedReportWorkflow {
  triggers: {
    type: 'cron';
    schedule: '0 8 * * 1';  // Monday 8 AM
    timezone: 'America/New_York';
  };
  
  steps: [
    {
      name: 'gather-report-data';
      type: 'parallel';
      branches: [
        {
          name: 'sales-data';
          type: 'database';
          query: 'SELECT * FROM sales WHERE date >= ?';
        },
        {
          name: 'user-metrics';
          type: 'database';
          query: 'SELECT * FROM user_metrics WHERE date >= ?';
        },
        {
          name: 'performance-data';
          type: 'http';
          url: 'https://analytics-api.com/metrics';
          method: 'GET';
        }
      ];
    },
    {
      name: 'process-report-data';
      type: 'function';
      code: `
        const processed = processReportData({
          sales: salesData,
          users: userMetrics,
          performance: performanceData
        });
        return processed;
      `;
    },
    {
      name: 'generate-report-pdf';
      type: 'function';
      code: `
        const pdf = generatePDFReport(processed, reportTemplate);
        const summary = generateExecutiveSummary(processed);
        return { pdf, summary };
      `;
    },
    {
      name: 'distribute-report';
      type: 'parallel';
      branches: [
        {
          name: 'email-executives';
          type: 'email';
          template: 'executive-report';
          attachments: ['pdf'];
          recipients: ['executives@company.com'];
        },
        {
          name: 'upload-to-portal';
          type: 'http';
          url: 'https://portal.company.com/reports';
          method: 'POST';
          body: { file: pdf, summary: summary };
        },
        {
          name: 'archive-to-storage';
          type: 'function';
          code: `
            archiveToCloudStorage(pdf, `reports/${date}/weekly-report.pdf`);
          `;
        }
      ];
    },
    {
      name: 'update-report-log';
      type: 'database';
      operation: 'insert';
      table: 'report_log';
      data: {
        type: 'weekly',
        generated_at: new Date(),
        status: 'completed'
      };
    }
  ];
}
```

#### Business Logic
- **Data Aggregation**: Collect data from multiple sources
- **Report Generation**: Create professional reports and summaries
- **Multi-channel Distribution**: Email, portal, and archive
- **Audit Trail**: Track report generation and distribution

#### Use Cases
- **Executive Reporting**: Weekly/monthly business reports
- **Financial Reporting**: Automated financial statements
- **Performance Reporting**: System and team performance metrics
- **Compliance Reporting**: Regulatory compliance reports

### 2. Dashboard Update Workflow
**Purpose**: Automated dashboard data refresh and updates

#### Workflow Steps
```typescript
interface DashboardUpdateWorkflow {
  triggers: {
    type: 'cron';
    schedule: '*/15 * * * *';  // Every 15 minutes
    timezone: 'UTC';
  };
  
  steps: [
    {
      name: 'collect-metrics';
      type: 'parallel';
      branches: [
        {
          name: 'business-metrics';
          type: 'database';
          query: 'SELECT * FROM business_metrics WHERE timestamp >= ?';
        },
        {
          name: 'system-metrics';
          type: 'http';
          url: 'https://monitoring-api.com/metrics';
          method: 'GET';
        },
        {
          name: 'user-activity';
          type: 'database';
          query: 'SELECT * FROM user_activity WHERE timestamp >= ?';
        }
      ];
    },
    {
      name: 'calculate-kpis';
      type: 'function';
      code: `
        const kpis = calculateKPIs({
          business: businessMetrics,
          system: systemMetrics,
          users: userActivity
        });
        return kpis;
      `;
    },
    {
      name: 'update-dashboard-cache';
      type: 'function';
      code: `
        updateCache('dashboard-data', kpis, 900); // 15 minutes
        updateWebSocketClients('dashboard-update', kpis);
      `;
    },
    {
      name: 'check-alert-thresholds';
      type: 'function';
      code: `
        const alerts = checkThresholds(kpis, alertThresholds);
        if (alerts.length > 0) {
          triggerAlerts(alerts);
        }
        return alerts;
      `;
    }
  ];
}
```

#### Business Logic
- **Real-time Data**: Collect up-to-date metrics
- **KPI Calculation**: Calculate key performance indicators
- **Cache Updates**: Update dashboard cache efficiently
- **Alert Monitoring**: Check and trigger alerts

#### Use Cases
- **Operations Dashboards**: Real-time operational metrics
- **Executive Dashboards**: Business performance tracking
- **System Monitoring**: Infrastructure and application metrics
- **Customer Support**: Support team performance metrics

---

These business workflow templates provide proven patterns for common business processes, enabling rapid deployment and reliable automation across various business functions and industries.
