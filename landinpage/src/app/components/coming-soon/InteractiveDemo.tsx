"use client";

import { useState } from "react";
import { Play, Pause, RotateCcw, Terminal, Code2, CheckCircle, AlertCircle, Rocket, Zap, Database, Settings } from "lucide-react";

export function InteractiveDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("typescript");

  const languages = [
    { id: "typescript", label: "TypeScript", icon: Code2 },
    { id: "python", label: "Python", icon: Terminal },
    { id: "go", label: "Go", icon: Settings }
  ];

  const workflowSteps = [
    {
      title: "Initialize Workflow",
      description: "Create a new durable workflow with automatic retry logic",
      status: "pending",
      duration: 2000
    },
    {
      title: "Process Payment",
      description: "Handle payment processing with built-in failure recovery",
      status: "pending", 
      duration: 3000
    },
    {
      title: "Update Database",
      description: "Update user records with transactional guarantees",
      status: "pending",
      duration: 1500
    },
    {
      title: "Send Notification",
      description: "Send confirmation email with automatic retries",
      status: "pending",
      duration: 2500
    },
    {
      title: "Complete",
      description: "Workflow completed successfully!",
      status: "pending",
      duration: 1000
    }
  ];

  const codeExamples = {
    typescript: `import { workflow } from '@torqvio/client';

const paymentWorkflow = workflow('payment-processing', {
  retryPolicy: {
    maxAttempts: 3,
    backoff: 'exponential'
  },
  timeout: '5m'
});

export async function processPayment(userId: string, amount: number) {
  // Step 1: Validate payment
  const payment = await paymentWorkflow.step(
    'validate-payment',
    () => validatePayment(userId, amount)
  );
  
  // Step 2: Charge customer
  const charge = await paymentWorkflow.step(
    'charge-customer',
    () => chargeCustomer(payment.id)
  );
  
  // Step 3: Update database
  await paymentWorkflow.step(
    'update-user-record',
    () => updateUserRecord(userId, charge.id)
  );
  
  // Step 4: Send receipt
  await paymentWorkflow.step(
    'send-receipt',
    () => emailReceipt(userId, charge.id)
  );
  
  return { success: true, chargeId: charge.id };
}`,
    python: `from torqvio import Workflow, step

payment_workflow = Workflow(
    "payment-processing",
    max_attempts=3,
    backoff="exponential",
    timeout="5m"
)

@payment_workflow.step
def validate_payment(user_id: str, amount: float):
    """Validate payment details"""
    return validate_payment_details(user_id, amount)

@payment_workflow.step  
def charge_customer(payment_id: str):
    """Process the actual charge"""
    return process_charge(payment_id)

@payment_workflow.step
def update_user_record(user_id: str, charge_id: str):
    """Update user in database"""
    return update_user(user_id, charge_id)

@payment_workflow.step
def send_receipt(user_id: str, charge_id: str):
    """Send confirmation email"""
    return send_email_receipt(user_id, charge_id)

def process_payment(user_id: str, amount: float):
    """Main payment workflow"""
    payment = validate_payment(user_id, amount)
    charge = charge_customer(payment.id)
    update_user_record(user_id, charge.id)
    send_receipt(user_id, charge.id)
    
    return {"success": True, "charge_id": charge.id}`,
    go: `package main

import (
    "github.com/torqvio/client"
)

func main() {
    workflow := client.NewWorkflow("payment-processing")
    workflow.SetMaxAttempts(3)
    workflow.SetBackoff("exponential")
    workflow.SetTimeout("5m")
    
    // Register workflow steps
    workflow.Step("validate-payment", validatePayment)
    workflow.Step("charge-customer", chargeCustomer)
    workflow.Step("update-record", updateUserRecord)
    workflow.Step("send-receipt", sendReceipt)
    
    // Execute workflow
    result, err := workflow.Execute(
        client.WithParam("userId", "user123"),
        client.WithParam("amount", 99.99),
    )
    
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Payment processed: %+v\\n", result)
}

func validatePayment(ctx client.Context) error {
    // Payment validation logic
    return nil
}

func chargeCustomer(ctx client.Context) error {
    // Charge processing logic
    return nil
}`
  };

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    runWorkflow();
  };

  const stopDemo = () => {
    setIsPlaying(false);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setWorkflowSteps(workflowSteps.map(step => ({ ...step, status: "pending" })));
  };

  const runWorkflow = async () => {
    const steps = [...workflowSteps];
    
    for (let i = 0; i < steps.length; i++) {
      if (!isPlaying) break;
      
      setCurrentStep(i);
      
      // Update step status to running
      steps[i].status = "running";
      setWorkflowSteps([...steps]);
      
      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      
      if (!isPlaying) break;
      
      // Update step status to completed
      steps[i].status = "completed";
      setWorkflowSteps([...steps]);
    }
    
    if (isPlaying) {
      setIsPlaying(false);
    }
  };

  const [workflowStepsState, setWorkflowSteps] = useState(workflowSteps);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <div className="h-4 w-4 rounded-full bg-purple animate-pulse" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-border" />;
    }
  };

  return (
    <section className="relative z-10 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-[clamp(28px,4vw,48px)] font-bold leading-[1.2]">
            See Torqvio in Action
          </h2>
          <p className="text-lg text-txt2 max-w-2xl mx-auto">
            Watch how durable workflows handle failures automatically. 
            Try the interactive demo and explore the code.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Interactive Demo */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Terminal className="h-5 w-5 text-purple" />
                Live Workflow Execution
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={isPlaying ? stopDemo : startDemo}
                  className="rounded-lg border border-border bg-surface2 p-2 text-purple hover:bg-purple/10 transition-colors"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={resetDemo}
                  className="rounded-lg border border-border bg-surface2 p-2 text-purple hover:bg-purple/10 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {workflowStepsState.map((step, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-3 transition-all duration-300 ${
                    index === currentStep && isPlaying
                      ? "border-purple/50 bg-purple/5"
                      : step.status === "completed"
                      ? "border-green/30 bg-green/5"
                      : "border-border bg-surface2"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-txt2">{step.description}</div>
                    </div>
                    {index === currentStep && isPlaying && (
                      <div className="text-xs text-purple animate-pulse">
                        Running...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {currentStep === workflowSteps.length && !isPlaying && (
              <div className="mt-4 rounded-lg border border-green/30 bg-green/10 p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green mx-auto mb-2" />
                <div className="font-semibold text-green">Workflow Completed Successfully!</div>
                <div className="text-sm text-txt2 mt-1">
                  All steps executed without manual intervention
                </div>
              </div>
            )}
          </div>

          {/* Code Preview */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-purple" />
                  Code Example
                </h3>
                
                {/* Language Selector */}
                <div className="flex gap-2">
                  {languages.map((lang) => {
                    const Icon = lang.icon;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors flex items-center gap-2 ${
                          selectedLanguage === lang.id
                            ? "bg-purple text-white"
                            : "bg-surface2 text-txt2 hover:bg-surface3"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code Display */}
              <div className="rounded-lg bg-bg border border-border overflow-hidden">
                <div className="border-b border-border px-4 py-2 bg-surface2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red" />
                    <div className="h-3 w-3 rounded-full bg-yellow" />
                    <div className="h-3 w-3 rounded-full bg-green" />
                    <span className="ml-4 text-xs text-txt3 font-mono">
                      payment.{selectedLanguage === "typescript" ? "ts" : selectedLanguage === "python" ? "py" : "go"}
                    </span>
                  </div>
                </div>
                <pre className="p-4 text-xs text-txt overflow-x-auto">
                  <code>{codeExamples[selectedLanguage as keyof typeof codeExamples]}</code>
                </pre>
              </div>
            </div>

            {/* Key Features Highlight */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green" />
                <span className="text-txt2">Automatic retry with exponential backoff</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green" />
                <span className="text-txt2">Step-level resume on failure</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green" />
                <span className="text-txt2">Built-in timeout and error handling</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green" />
                <span className="text-txt2">Real-time execution tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-4 py-2 text-sm font-semibold text-purple-l">
            <AlertCircle className="h-4 w-4" />
            Try this yourself in our beta program
          </div>
        </div>
      </div>
    </section>
  );
}
