# Workflow Examples

This directory contains example workflow definitions that demonstrate various patterns and capabilities of Torqvio.

## Examples

### 1. Simple Approval Workflow (`simple-approval-workflow.json`)
A basic workflow that demonstrates:
- Sequential step execution
- Approval gates with timeout and escalation
- Email notifications
- Error handling paths

**Use case**: Request approval processes like expense reports, leave requests, or document approvals.

### 2. Data Pipeline Workflow (`data-pipeline-workflow.json`)
A comprehensive data processing pipeline that shows:
- Data extraction from APIs
- Transformation and validation steps
- Quality checks with thresholds
- Error handling and retry policies
- Multi-channel notifications

**Use case**: ETL processes, data synchronization, or any batch data processing.

### 3. Scheduled Report Workflow (`scheduled-report-workflow.json`)
A time-based workflow that demonstrates:
- Scheduled execution with cron expressions
- Multi-source data aggregation
- Report generation with templates
- Document distribution via email and Slack
- Archiving to cloud storage

**Use case**: Automated reporting, dashboard updates, or any scheduled business processes.

## Using These Examples

1. **Import via UI**: Navigate to the Workflows section and use the "Import" button to load any example.

2. **API Import**: Send a POST request to `/api/workflows/import` with the workflow JSON.

3. **Copy and Modify**: Use these as templates for your own workflows by copying and adapting the structure.

## Key Patterns Demonstrated

### Error Handling
```json
{
  "from": "extract-data",
  "to": "handle-error",
  "condition": "error"
}
```

### Retry Policies
```json
{
  "retryPolicy": {
    "maxAttempts": 3,
    "backoff": "exponential",
    "initialDelay": 1000
  }
}
```

### Conditional Transitions
```json
{
  "from": "approval-required",
  "to": "send-email",
  "condition": "approved"
}
```

### Scheduled Execution
```json
{
  "schedule": {
    "type": "cron",
    "expression": "0 9 * * 1",
    "timezone": "UTC"
  }
}
```

## Best Practices Shown

- **Clear step naming**: Each step has a descriptive name and purpose
- **Proper error handling**: Every action step has corresponding error transitions
- **Validation before processing**: Data is validated before major operations
- **Notification patterns**: Success and failure notifications are configured
- **Modular design**: Steps are focused on single responsibilities

## Adapting for Your Needs

When modifying these examples:

1. Update the `name` and `description` fields
2. Modify step configurations to match your systems
3. Add or remove steps based on your requirements
4. Update transition conditions to match your business logic
5. Test workflows in a development environment before production use

For more detailed information on workflow definitions, see the [Workflow Documentation](/docs/workflows).
