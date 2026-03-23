# torqvio-client

Official Torqvio client library for Python applications.

## Installation

```bash
pip install torqvio-client
```

## Quick Start

```python
import torqvio

client = torqvio.TorqvioClient(
    api_key="your-api-key",
    base_url="https://api.torqvio.com"
)

# Create a workflow
workflow = client.workflows.create({
    "name": "Order Processing",
    "description": "Process customer orders",
    "steps": [
        {
            "name": "validate-order",
            "type": "function",
            "config": {"function_name": "validateOrder"}
        },
        {
            "name": "process-payment",
            "type": "webhook",
            "config": {"url": "https://api.payment.com/process"}
        }
    ]
})

# Trigger a workflow
execution = client.workflows.trigger(workflow.id, {
    "order_id": "12345",
    "customer_id": "67890",
    "amount": 99.99
})

# Listen to events
@client.events.on('workflow.completed')
def on_workflow_completed(event):
    print(f"Workflow completed: {event.data}")

@client.events.on('workflow.failed')
def on_workflow_failed(event):
    print(f"Workflow failed: {event.error}")
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| api_key | str | - | Your API key |
| base_url | str | https://api.torqvio.com | API base URL |
| timeout | int | 30 | Request timeout in seconds |
| retries | int | 3 | Number of retry attempts |

## License

MIT © Torqvio Team
