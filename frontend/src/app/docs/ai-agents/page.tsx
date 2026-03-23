'use client'

import { motion } from 'framer-motion'
import { Bot, Code2, Zap, Shield, Brain, Cpu } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AIAgentsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li>
            <Link href="/docs" className="hover:text-white transition-colors">
              Documentation
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="text-white">AI Agents</span>
          </li>
        </ol>
      </motion.nav>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
            <Bot className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Agents
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                intermediate
              </span>
              <span className="text-gray-400">8 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated today</span>
            </div>
          </div>
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Build intelligent AI agents that can automate complex workflows, make decisions, 
          and interact with external systems using Torqvio's durable execution framework.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-12"
      >
        {/* Overview */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Intelligent Workflow Automation</h2>
              <p className="text-gray-300">
                AI agents combine the reliability of Torqvio workflows with the intelligence 
                of modern AI models to create powerful automation solutions.
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Key Features */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-white mb-6">Key Capabilities</h2>
            <div className="space-y-4">
              {[
                { 
                  icon: Brain, 
                  title: 'Decision Making', 
                  desc: 'AI-powered decision trees and conditional logic based on context and data',
                  color: 'from-purple-500/20 to-pink-500/20'
                },
                { 
                  icon: Zap, 
                  title: 'Real-time Processing', 
                  desc: 'Process events and respond to triggers with intelligent actions',
                  color: 'from-yellow-500/20 to-orange-500/20'
                },
                { 
                  icon: Shield, 
                  title: 'Safe Execution', 
                  desc: 'Durable execution with rollback and error handling for AI decisions',
                  color: 'from-green-500/20 to-emerald-500/20'
                },
                { 
                  icon: Cpu, 
                  title: 'Multi-Model Support', 
                  desc: 'Integration with OpenAI, Claude, Gemini, and custom AI models',
                  color: 'from-blue-500/20 to-cyan-500/20'
                },
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-colors">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">On this page</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#overview" className="text-gray-400 hover:text-white transition-colors">Overview</a></li>
                  <li><a href="#key-capabilities" className="text-gray-400 hover:text-white transition-colors">Key Capabilities</a></li>
                  <li><a href="#getting-started" className="text-gray-400 hover:text-white transition-colors">Getting Started</a></li>
                  <li><a href="#examples" className="text-gray-400 hover:text-white transition-colors">Examples</a></li>
                  <li><a href="#best-practices" className="text-gray-400 hover:text-white transition-colors">Best Practices</a></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section id="getting-started" className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Getting Started</h2>
          
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Basic AI Agent</h3>
              <button
                onClick={() => navigator.clipboard.writeText(`import { Torqvio, AIAgent } from '@torqvio/core'
import { OpenAI } from '@torqvio/ai-providers'

const aiAgent = new AIAgent({
  name: 'customer-support',
  provider: new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  }),
  workflow: async (input, context) => {
    // AI-powered decision making
    const response = await context.ai.generate({
      prompt: \`Customer message: \${input.message}\`,
      system: 'You are a helpful customer support agent.',
      tools: ['escalate', 'refund', 'information']
    })
    
    return response
  }
})

await torqvio.startAgent(aiAgent)`)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Copy Code
              </button>
            </div>
            <div className="bg-gray-950 rounded-xl p-6 overflow-x-auto">
              <pre className="text-sm text-green-400">
                <code>{`import { Torqvio, AIAgent } from '@torqvio/core'
import { OpenAI } from '@torqvio/ai-providers'

const aiAgent = new AIAgent({
  name: 'customer-support',
  provider: new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  }),
  workflow: async (input, context) => {
    // AI-powered decision making
    const response = await context.ai.generate({
      prompt: \`Customer message: \${input.message}\`,
      system: 'You are a helpful customer support agent.',
      tools: ['escalate', 'refund', 'information']
    })
    
    return response
  }
})

await torqvio.startAgent(aiAgent)`}</code>
              </pre>
            </div>
            <p className="text-gray-300 mt-4">
              Create an AI agent that can handle customer support inquiries with intelligent responses.
            </p>
          </div>
        </section>

        {/* Examples */}
        <section id="examples" className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Common Use Cases</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Code Review Agent</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Automatically review code submissions, suggest improvements, and enforce coding standards.
              </p>
              <div className="bg-gray-800 rounded-lg p-3">
                <code className="text-xs text-green-400">ai-agent create code-review --model=gpt-4</code>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Data Processing Agent</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Process and analyze large datasets with intelligent data transformation and validation.
              </p>
              <div className="bg-gray-800 rounded-lg p-3">
                <code className="text-xs text-green-400">ai-agent create data-processor --provider=claude</code>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Security Monitor</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Monitor system events and automatically respond to security threats with AI-driven analysis.
              </p>
              <div className="bg-gray-800 rounded-lg p-3">
                <code className="text-xs text-green-400">ai-agent create security-monitor --auto-respond</code>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Chat Assistant</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Build intelligent chatbots that can handle complex conversations and maintain context.
              </p>
              <div className="bg-gray-800 rounded-lg p-3">
                <code className="text-xs text-green-400">ai-agent create chat-assistant --memory</code>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section id="best-practices" className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Best Practices</h2>
          
          <div className="space-y-4">
            {[
              {
                title: 'Define Clear Objectives',
                description: 'Set specific goals and success criteria for your AI agents to ensure measurable outcomes.',
                type: 'critical'
              },
              {
                title: 'Implement Guardrails',
                description: 'Add safety checks and validation to prevent AI agents from taking unintended actions.',
                type: 'warning'
              },
              {
                title: 'Monitor Performance',
                description: 'Track agent performance, decision accuracy, and response times to optimize effectiveness.',
                type: 'info'
              },
              {
                title: 'Use Structured Prompts',
                description: 'Design clear, consistent prompts with specific formatting for reliable AI responses.',
                type: 'success'
              },
            ].map((practice, index) => (
              <div key={index} className={`p-4 rounded-xl border ${
                practice.type === 'critical' ? 'bg-red-900/20 border-red-800/50' :
                practice.type === 'warning' ? 'bg-yellow-900/20 border-yellow-800/50' :
                practice.type === 'info' ? 'bg-blue-900/20 border-blue-800/50' :
                'bg-green-900/20 border-green-800/50'
              }`}>
                <h3 className="font-semibold text-white mb-2">{practice.title}</h3>
                <p className="text-gray-300 text-sm">{practice.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/client-sdk"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Client SDK
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn about the full SDK capabilities for building advanced AI agents.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                Explore SDK →
              </div>
            </Link>

            <Link
              href="/docs/configuration"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Configuration
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Configure AI providers, security settings, and performance optimization.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                Configure →
              </div>
            </Link>
          </div>
        </section>
      </motion.div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm">
            © 2024 Torqvio. Built with durability in mind.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              GitHub
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              Discord
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              Twitter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
