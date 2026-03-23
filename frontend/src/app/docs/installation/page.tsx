'use client'

import { motion } from 'framer-motion'
import { Terminal, CheckCircle, Package, Rocket, Bot } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function InstallationPage() {
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
            <span className="text-white">Installation</span>
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
            <Terminal className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Installation
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                beginner
              </span>
              <span className="text-gray-400">5 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated 2 days ago</span>
            </div>
          </div>
          <button
            onClick={(event) => {
              const markdownContent = `# Torqvio Installation Guide

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Architecture Overview
\`\`\`
browser ↔ frontend:7243 (Next.js/React)
    ↑ HTTP/WebSocket
backend:8459 (Node/Express) ↔ PostgreSQL® (state + workflows)
           ↕ Redis® (optional: sessions + cache)
\`\`\`

## Prerequisites
- **Node.js 18+** - Required for both frontend and backend
- **PostgreSQL®** - Primary database for workflow state
- **Redis® (Optional)** - For caching and session storage
- **Git™** - For cloning the repository
- **npm** - Package manager (not pnpm, not yarn)

## Environment Variables (Required)

> 🔒 **Security Notice**: Never commit actual \`.env\` files to version control. Use the provided \`.env.example\` files as templates and replace placeholder values with your actual secrets.

| Variable | Required? | Purpose | Example |
|----------|-----------|---------|---------|
| \`DATABASE_URL\` | Yes | PostgreSQL connection | \`postgres://user:pass@localhost:5432/torqvio\` |
| \`JWT_SECRET\` | Yes (prod) | Auth tokens (min 32 chars) | \`your-super-secret-jwt-key\` |
| \`NEXTAUTH_SECRET\` | Yes (prod) | NextAuth.js (min 32 chars) | \`your-nextauth-secret-key\` |
| \`REDIS_URL\` | No | Session & cache | \`redis://localhost:6379\` |
| \`NODE_ENV\` | No | Environment | \`development\` |

### OAuth Providers (Optional)
| Variable | Purpose | How to Get |
|----------|---------|------------|
| \`GITHUB_CLIENT_ID/SECRET\` | GitHub OAuth login | GitHub OAuth App Settings |
| \`GOOGLE_CLIENT_ID/SECRET\` | Google OAuth login | Google Cloud Console |

### Setup Instructions
\`\`\`bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your actual values

# Frontend environment  
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local with your actual values
\`\`\`

## Installation Methods

### Local Development (Recommended)
\`\`\`bash
# Clone the repository
git clone https://github.com/your-org/torqvio.git
cd torqvio

# Install dependencies (use npm only)
npm install
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Database setup
cd backend && npm run db:migrate && npm run db:seed

# Start development servers
npm run dev  # Starts both frontend and backend
\`\`\`

✓ Full source code access  
✓ Complete development environment  
✓ Easy customization  
✓ Full debugging capabilities

### Docker® Compose
\`\`\`bash
git clone https://github.com/your-org/torqvio.git
cd torqvio
docker-compose up -d
\`\`\`

✓ All services included  
✓ Zero configuration setup  
✓ Production-ready  
✓ Isolated environment

## Development Commands

### From Root Directory
\`\`\`bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend:7243
npm run dev:backend      # Start only backend:8459
npm run build            # Build both applications
npm run typecheck        # TypeScript validation
npm run lint             # ESLint check
npm run test             # Backend + frontend unit tests
\`\`\`

### Database Operations (from backend/)
\`\`\`bash
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed initial data
\`\`\`

## Application URLs
- **Frontend**: http://localhost:7243
- **Backend API**: http://localhost:8459
- **Documentation**: http://localhost:7243/docs

## AI Assistant Quick Start

If you're using Cursor, Claude Code, GitHub Copilot Workspace, or similar:

1. **AGENTS.md** is automatically read for project context
2. Ask your AI assistant:
   - "Explain how workflows are stored and executed"
   - "Generate new workflow step: send email after approval"
   - "Write OpenAPI spec for POST /workflows"
   - "Add a new UI component with shadcn/ui"
   - "Set up database migration for new table"

## Project Structure
\`\`\`
torqvio/
├── backend/           # Node.js/Express API server
│   ├── src/
│   │   ├── api/       # API routes and endpoints
│   │   ├── database/  # Database layer & migrations
│   │   ├── features/  # Business logic modules
│   │   └── workflows/ # Workflow execution engine
├── frontend/          # Next.js React application
│   ├── src/
│   │   ├── app/       # Next.js app router pages
│   │   ├── components/ # Reusable UI components
│   │   └── features/  # Feature-specific components
├── AGENTS.md          # AI assistant instructions
└── README.md          # This file
\`\`\`

## Code Style & Patterns
- **2-space indentation** everywhere
- **TypeScript strict mode** enabled
- **Zod schemas** for all API validation
- **Functional React components** (no classes)
- **Async/await** (no callbacks)
- **Unit tests** for new business logic

## Next Steps

### Quick Start Guide
Build your first workflow in 5 minutes with our step-by-step guide.

### Configuration
Set up your environment, database, and advanced settings.

---

© 2024 Torqvio. Built with durability in mind.`
              
              navigator.clipboard.writeText(markdownContent).then(() => {
                // Show success feedback
                const button = event.currentTarget as HTMLButtonElement
                const originalText = button.innerHTML
                button.innerHTML = '<CheckCircle className="w-4 h-4" /> Copied!'
                button.classList.add('bg-green-500', 'hover:bg-green-600')
                button.classList.remove('from-purple-500', 'to-pink-500', 'hover:from-purple-600', 'hover:to-pink-600')
                
                setTimeout(() => {
                  button.innerHTML = originalText
                  button.classList.remove('bg-green-500', 'hover:bg-green-600')
                  button.classList.add('from-purple-500', 'to-pink-500', 'hover:from-purple-600', 'hover:to-pink-600')
                }, 2000)
              })
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center gap-2"
            title="Copy markdown formatted for AI code editors to clipboard"
          >
            <Bot className="w-4 h-4" />
            Copy for AI
          </button>
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Set up Torqvio locally and get the full-stack application running in minutes. 
          Complete development environment with frontend and backend.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-12"
      >
        {/* Quick Start CTA */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-12 border border-purple-800/50">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Follow our quick start guide to build your first workflow in 5 minutes.</p>
            <Link
              href="/docs/quick-start"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold text-lg transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105"
            >
              <Terminal className="w-5 h-5" />
              Quick Start
              <div className="w-0 group-hover:w-5 h-5 overflow-hidden transition-all flex items-center justify-center">
                →
              </div>
            </Link>
          </div>
        </div>

        {/* Prerequisites */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-white mb-6">Prerequisites</h2>
            <div className="space-y-4">
              {[
                { icon: '/icons/nodejs-hex-logo.svg?v=2', title: 'Node.js 18+', desc: 'Required for both frontend and backend' },
                { icon: '/icons/postgresql-official-elephant.png', title: 'PostgreSQL®', desc: 'Primary database for workflow state' },
                { icon: '/icons/redis-official.svg', title: 'Redis® (Optional)', desc: 'For caching and session storage' },
                { icon: '/icons/git-official.svg', title: 'Git™', desc: 'For cloning the repository' },
              ].map((req, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-colors">
                  <Image 
                      src={req.icon} 
                      alt={req.title}
                      width={64}
                      height={64}
                      className="w-16 h-16"
                    />
                  <div>
                    <h3 className="font-semibold text-white mb-1">{req.title}</h3>
                    <p className="text-gray-400 text-sm">{req.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">On this page</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#prerequisites" className="text-gray-400 hover:text-white transition-colors">Prerequisites</a></li>
                  <li><a href="#installation-methods" className="text-gray-400 hover:text-white transition-colors">Installation Methods</a></li>
                  <li><a href="#quick-start" className="text-gray-400 hover:text-white transition-colors">Quick Start</a></li>
                  <li><a href="#next-steps" className="text-gray-400 hover:text-white transition-colors">Next Steps</a></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Installation Methods */}
        <section id="installation-methods" className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white whitespace-nowrap">Installation Methods</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Local Development */}
            <div className="group relative bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
              <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium">
                Recommended
              </div>
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-3">
                  <Terminal className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Local Development</h3>
                <p className="text-gray-400 text-sm">Clone and run the full source code</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 mb-3">
                <code className="text-xs text-green-400">git clone https://github.com/your-org/torqvio.git</code>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ Full source code access</li>
                <li>✓ Complete development environment</li>
                <li>✓ Easy customization</li>
              </ul>
            </div>

            {/* Docker Compose */}
            <div className="group bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
              <div className="mb-4">
                <Image 
                  src="/icons/docker-official-ocean.svg" 
                  alt="Docker"
                  width={48}
                  height={48}
                  className="w-12 h-12 mb-3"
                />
                <h3 className="text-xl font-semibold text-white mb-2">Docker® Compose</h3>
                <p className="text-gray-400 text-sm">All services included</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 mb-3">
                <code className="text-xs text-green-400">docker-compose up -d</code>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ All services included</li>
                <li>✓ Zero configuration setup</li>
                <li>✓ Production-ready</li>
              </ul>
            </div>

            {/* Binary Download */}
            <div className="group bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-3">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Binary Download</h3>
                <p className="text-gray-400 text-sm">Pre-compiled executables</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 mb-3">
                <code className="text-xs text-green-400">npm install -g torqvio</code>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ No build tools required</li>
                <li>✓ Single command install</li>
                <li>✓ System-wide availability</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Start Code */}
        <section id="quick-start" className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white whitespace-nowrap">Quick Start</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Local Development Setup</h3>
              <button
                onClick={() => navigator.clipboard.writeText(`# Clone the repository
git clone https://github.com/your-org/torqvio.git
cd torqvio

# Install dependencies (use npm only)
npm install
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Database setup
cd backend && npm run db:migrate && npm run db:seed

# Start the development servers
npm run dev  # Starts both frontend and backend`)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Copy Code
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-xs text-gray-400 font-mono">terminal</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Clone the repository
git clone https://github.com/your-org/torqvio.git
cd torqvio

# Install dependencies (use npm only)
npm install
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Database setup
cd backend && npm run db:migrate && npm run db:seed

# Start the development servers
npm run dev  # Starts both frontend and backend`}</code>
                </pre>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                Application URLs
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-300">
                  <span className="text-gray-400">Frontend:</span>{' '}
                  <code className="text-green-400">http://localhost:7243</code>
                </p>
                <p className="text-sm text-gray-300">
                  <span className="text-gray-400">Backend API:</span>{' '}
                  <code className="text-green-400">http://localhost:8459</code>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section id="next-steps" className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/quick-start"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Quick Start Guide
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Build your first workflow in 5 minutes with our step-by-step guide.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                Get Started →
              </div>
            </Link>

            <Link
              href="/docs/configuration"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Configuration
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Set up your environment, database, and advanced settings.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                Configure →
              </div>
            </Link>
          </div>
        </section>
      </motion.div>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-zinc-600/50">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {/* Top row - Copyright and social links */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-zinc-300 text-sm">
              © {new Date().getFullYear()} Torqvio. Built with durability in mind.
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">
                GitHub
              </Link>
              <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">
                Discord
              </Link>
              <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">
                Twitter
              </Link>
            </div>
          </div>
          
          {/* Bottom row - Trademarks */}
          <div className="text-zinc-400 text-xs text-center leading-relaxed space-y-2">
            <div>PostgreSQL® and the Slonik Logo are trademarks or registered trademarks of the PostgreSQL Community Association of Canada, and used with their permission.</div>
            <div>Redis® is a registered trademark of Redis Ltd. Any rights therein are reserved to Redis Ltd.</div>
            <div>Git™ and the Git logo are either registered trademarks or trademarks of Software Freedom Conservancy, Inc., corporate home of the Git Project, in the United States and/or other countries.</div>
            <div>Docker® and the Docker logo are trademarks or registered trademarks of Docker, Inc. in the United States and/or other countries.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
