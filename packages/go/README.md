# client-go

Official Torqvio client library for Go applications.

## Installation

```bash
go get github.com/torqvio/client-go
```

## Quick Start

```go
package main

import (
    "fmt"
    "log"
    
    "github.com/torqvio/client-go"
)

func main() {
    client := torqvio.NewClient(&torqvio.Config{
        APIKey:  "your-api-key",
        BaseURL: "https://api.torqvio.com",
    })

    // Create a workflow
    workflow, err := client.Workflows.Create(&torqvio.WorkflowRequest{
        Name:        "Order Processing",
        Description: "Process customer orders",
        Steps: []torqvio.WorkflowStep{
            {
                Name: "validate-order",
                Type: "function",
                Config: map[string]interface{}{
                    "function_name": "validateOrder",
                },
            },
            {
                Name: "process-payment",
                Type: "webhook",
                Config: map[string]interface{}{
                    "url": "https://api.payment.com/process",
                },
            },
        },
    })
    if err != nil {
        log.Fatal(err)
    }

    // Trigger a workflow
    execution, err := client.Workflows.Trigger(workflow.ID, map[string]interface{}{
        "order_id":    "12345",
        "customer_id": "67890",
        "amount":      99.99,
    })
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Workflow execution started: %s\n", execution.ID)
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| APIKey | string | - | Your API key |
| BaseURL | string | https://api.torqvio.com | API base URL |
| Timeout | time.Duration | 30s | Request timeout |
| Retries | int | 3 | Number of retry attempts |

## License

MIT © Torqvio Team
