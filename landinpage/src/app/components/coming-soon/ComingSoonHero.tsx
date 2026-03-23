"use client";

import { useState, useEffect } from "react";
import { LogoFull } from "../Logo";
import { Zap, RefreshCw, Eye, Play, Pause, RotateCcw, Rocket, CheckCircle, Settings, Database } from "lucide-react";

export function ComingSoonHero() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const workflowSteps = [
    { icon: Rocket, label: "Initialize", status: "completed" },
    { icon: Zap, label: "Execute", status: "completed" },
    { icon: RefreshCw, label: "Retry", status: "current" },
    { icon: CheckCircle, label: "Complete", status: "pending" }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % workflowSteps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, workflowSteps.length]);

  return (
    <header className="relative overflow-hidden px-6 pb-16 pt-32 text-center">
      {/* Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-100px] h-[500px] w-[700px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(108,92,231,0.15) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Logo - Much larger */}
        <div className="mb-12 flex justify-center">
          <LogoFull className="text-purple" iconSize={64} />
        </div>

        {/* Coming Soon Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-yellow/30 bg-yellow/10 px-4 py-2 text-sm font-semibold text-yellow-l" role="status" aria-live="polite">
          <span
            className="h-2 w-2 rounded-full bg-yellow animate-pulse-dot"
            style={{ boxShadow: "0 0 8px #FBBF24" }}
            aria-hidden="true"
          />
          Coming Soon
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-[clamp(36px,6vw,64px)] font-black leading-[1.1] tracking-[-0.04em]">
          The Durable Execution
          <br />
          <span className="gradient-text">Engine is coming.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-12 max-w-[600px] text-[clamp(18px,2.5vw,22px)] leading-relaxed text-txt2">
          Never lose a workflow again. Torqvio brings durable serverless workflows with 
          automatic retries, step-level resume, and real-time observability.
        </p>

        {/* Interactive Workflow Demo */}
        {/*
        <section className="mb-12 rounded-2xl border border-border bg-gradient-to-br from-surface to-surface2/50 backdrop-blur-sm p-8 shadow-lg" aria-labelledby="workflow-demo-title">
          <div className="mb-6 flex items-center justify-between">
            <h2 id="workflow-demo-title" className="text-xl font-bold bg-gradient-to-r from-purple to-purple-l bg-clip-text text-transparent">
              Live Workflow Execution
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="rounded-xl border border-purple/30 bg-purple/10 p-3 text-purple hover:bg-purple/20 transition-all hover:scale-105"
                aria-label={isPlaying ? "Pause demo" : "Play demo"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setCurrentStep(0)}
                className="rounded-xl border border-border bg-surface2 p-3 text-purple hover:bg-purple/10 transition-all hover:scale-105"
                aria-label="Reset demo"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-border">
              <div 
                className="h-full bg-gradient-to-r from-purple to-purple-l transition-all duration-1000"
                style={{ width: `${(currentStep / (workflowSteps.length - 1)) * 100}%` }}
              />
            </div>
            
            <div className="relative flex items-center justify-between">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isPending = index > currentStep;
                
                return (
                  <div key={index} className="flex flex-col items-center gap-3">
                    <div
                      className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all duration-500 ${
                        isActive
                          ? "border-purple bg-purple text-white shadow-[0_0_30px_rgba(108,92,231,0.6)] scale-110"
                          : isCompleted
                          ? "border-green bg-green text-white"
                          : isPending
                          ? "border-border bg-surface2 text-txt3"
                          : "border-border bg-surface text-txt2"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      
                      {isActive && (
                        <div className="absolute inset-0 rounded-2xl border-2 border-purple animate-ping" />
                      )}
                    </div>
                
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        isActive ? "text-purple" : isCompleted ? "text-green" : "text-txt2"
                      }`}>
                        {step.label}
                      </div>
                      {isActive && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-purple animate-pulse" />
                          <span className="text-xs text-purple">Processing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        
        <div className="mt-8 rounded-xl border border-purple/20 bg-purple/5 p-4 text-center">
          <p className="text-sm font-medium text-purple-l">
            {workflowSteps[currentStep].label} step {currentStep + 1} of {workflowSteps.length}
          </p>
          <p className="text-xs text-txt3 mt-1">
            Torqvio ensures every step completes successfully with automatic retries
          </p>
        </div>
        </section>
        */}

        {/* Key Features Preview */}
        <section className="mb-12" aria-labelledby="features-title">
          <h2 id="features-title" className="sr-only">Key Features</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
            className={`rounded-xl border transition-all duration-300 p-4 backdrop-blur-sm cursor-pointer ${
                hoveredFeature === 0
                  ? "border-purple/50 bg-purple/10 shadow-[0_8px_28px_rgba(108,92,231,0.2)]"
                  : "border-border bg-surface/50"
              }`}
              onMouseEnter={() => setHoveredFeature(0)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="mb-2 flex justify-center">
                <Zap className={`h-8 w-8 transition-colors ${
                  hoveredFeature === 0 ? "text-purple-l" : "text-purple"
                }`} />
              </div>
              <div className="font-semibold">Lightning Fast</div>
              <div className="text-sm text-txt2">Minimal overhead, maximum reliability</div>
              {hoveredFeature === 0 && (
                <div className="mt-2 text-xs text-purple-l">
                  Optimized for performance
                </div>
              )}
            </div>
            
            <div
              className={`rounded-xl border transition-all duration-300 p-4 backdrop-blur-sm cursor-pointer ${
                hoveredFeature === 1
                  ? "border-purple/50 bg-purple/10 shadow-[0_8px_28px_rgba(108,92,231,0.2)]"
                  : "border-border bg-surface/50"
              }`}
              onMouseEnter={() => setHoveredFeature(1)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="mb-2 flex justify-center">
                <RefreshCw className={`h-8 w-8 transition-colors ${
                  hoveredFeature === 1 ? "text-purple-l" : "text-purple"
                }`} />
              </div>
              <div className="font-semibold">Auto-Retry</div>
              <div className="text-sm text-txt2">Intelligent retries with exponential backoff</div>
              {hoveredFeature === 1 && (
                <div className="mt-2 text-xs text-purple-l">
                  Configurable retry policies
                </div>
              )}
            </div>
            
            <div
              className={`rounded-xl border transition-all duration-300 p-4 backdrop-blur-sm cursor-pointer ${
                hoveredFeature === 2
                  ? "border-purple/50 bg-purple/10 shadow-[0_8px_28px_rgba(108,92,231,0.2)]"
                  : "border-border bg-surface/50"
              }`}
              onMouseEnter={() => setHoveredFeature(2)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="mb-2 flex justify-center">
                <Eye className={`h-8 w-8 transition-colors ${
                  hoveredFeature === 2 ? "text-purple-l" : "text-purple"
                }`} />
              </div>
              <div className="font-semibold">Observable</div>
              <div className="text-sm text-txt2">Real-time dashboard and execution tracking</div>
              {hoveredFeature === 2 && (
                <div className="mt-2 text-xs text-purple-l">
                  Real-time execution monitoring
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </header>
  );
}
