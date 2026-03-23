'use client'

import { useState } from 'react'
import { Play, Copy, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react'

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
    default?: string
  }>
  body?: Record<string, any>
  headers?: Record<string, string>
}

const API_ENDPOINTS: Record<string, APIEndpoint> = {
  'create-flow': {
    method: 'POST',
    path: '/api/v1/flows',
    description: 'Create a new workflow',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      name: 'Welcome Flow',
      definition: {
        id: 'welcome-flow',
        steps: [
          {
            name: 'send-welcome',
            handler: 'async (input) => { console.log("Welcome to Torqvio!"); return { success: true }; }'
          }
        ]
      }
    },
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Flow name' },
      { name: 'definition', type: 'object', required: true, description: 'Flow definition' }
    ]
  },
  'list-flows': {
    method: 'GET',
    path: '/api/v1/flows',
    description: 'List all workflows',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  'execute-flow': {
    method: 'POST',
    path: '/api/v1/flows/{flowId}/execute',
    description: 'Execute a workflow',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      payload: {}
    },
    parameters: [
      { name: 'flowId', type: 'string', required: true, description: 'Flow ID to execute' },
      { name: 'payload', type: 'object', required: false, description: 'Input data for the flow' }
    ]
  },
  'get-flow': {
    method: 'GET',
    path: '/api/v1/flows/{flowId}',
    description: 'Get specific workflow details',
    headers: {
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'flowId', type: 'string', required: true, description: 'Flow ID' }
    ]
  }
}

const LANGUAGE_TEMPLATES = {
  curl: (endpoint: APIEndpoint, baseUrl: string) => {
    const headers = Object.entries(endpoint.headers || {})
      .map(([key, value]) => `  -H "${key}: ${value}"`)
      .join(' \\\n')
    
    let body = ''
    if (endpoint.body) {
      body = ` \\\n  -d '${JSON.stringify(endpoint.body, null, 2)}'`
    }

    let path = endpoint.path.replace('{flowId}', 'welcome-flow')
    
    return `curl -X ${endpoint.method} ${baseUrl}${path} \\\n${headers}${body}`
  },
  javascript: (endpoint: APIEndpoint, baseUrl: string) => {
    const headers = JSON.stringify(endpoint.headers || {}, null, 2)
    let path = endpoint.path.replace('{flowId}', 'welcome-flow')
    
    if (endpoint.method === 'GET') {
      return `const response = await fetch('${baseUrl}${path}', {
  method: '${endpoint.method}',
  headers: ${headers}
});

const data = await response.json();
console.log(data);`
    } else {
      return `const response = await fetch('${baseUrl}${path}', {
  method: '${endpoint.method}',
  headers: ${headers},
  body: JSON.stringify(${JSON.stringify(endpoint.body || {}, null, 2)})
});

const data = await response.json();
console.log(data);`
    }
  },
  python: (endpoint: APIEndpoint, baseUrl: string) => {
    const headers = JSON.stringify(endpoint.headers || {}, null, 2)
    let path = endpoint.path.replace('{flowId}', 'welcome-flow')
    
    if (endpoint.method === 'GET') {
      return `import requests

response = requests.get(
    '${baseUrl}${path}',
    headers=${headers}
)

data = response.json()
print(data)`
    } else {
      return `import requests

response = requests.post(
    '${baseUrl}${path}',
    headers=${headers},
    json=${JSON.stringify(endpoint.body || {}, null, 2)}
)

data = response.json()
print(data)`
    }
  }
}

type Language = keyof typeof LANGUAGE_TEMPLATES

export default function APITryItPanel({ endpointKey }: { endpointKey: string }) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('curl')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showHeaders, setShowHeaders] = useState(true)
  const [showBody, setShowBody] = useState(true)

  const endpoint = API_ENDPOINTS[endpointKey]
  if (!endpoint) return null

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'
  const code = LANGUAGE_TEMPLATES[selectedLanguage](endpoint, baseUrl)

  const handleTryIt = async () => {
    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      let path = endpoint.path.replace('{flowId}', 'welcome-flow')
      const response = await fetch(`${baseUrl}${path}`, {
        method: endpoint.method,
        headers: endpoint.headers || {},
        body: endpoint.method !== 'GET' ? JSON.stringify(endpoint.body || {}) : undefined
      })

      const data = await response.json()
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data: data
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
    if (status >= 400 && status < 500) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    if (status >= 500) return 'text-red-400 bg-red-400/10 border-red-400/30'
    return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
  }

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`px-2 py-1 rounded text-xs font-mono font-medium ${
              endpoint.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
              endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
              endpoint.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {endpoint.method}
            </div>
            <code className="text-sm text-gray-300">{endpoint.path}</code>
          </div>
          <button
            onClick={handleTryIt}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                Try It
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">{endpoint.description}</p>
      </div>

      {/* Language Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-700/50">
        {Object.keys(LANGUAGE_TEMPLATES).map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang as Language)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedLanguage === lang
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="relative">
        <div className="bg-gray-950 p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300">
            <code>{code}</code>
          </pre>
        </div>
      </div>

      {/* Parameters */}
      {(endpoint.parameters || endpoint.body) && (
        <div className="border-t border-gray-700/50">
          {/* Headers Toggle */}
          {endpoint.headers && (
            <div>
              <button
                onClick={() => setShowHeaders(!showHeaders)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/30 transition-colors"
              >
                <span className="text-sm font-medium text-gray-300">Headers</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showHeaders ? 'rotate-180' : ''}`} />
              </button>
              {showHeaders && (
                <div className="px-4 pb-3 space-y-2">
                  {Object.entries(endpoint.headers).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <code className="text-purple-400">{key}:</code>
                      <span className="text-gray-300">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Body Toggle */}
          {endpoint.body && (
            <div>
              <button
                onClick={() => setShowBody(!showBody)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/30 transition-colors border-t border-gray-700/50"
              >
                <span className="text-sm font-medium text-gray-300">Body</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showBody ? 'rotate-180' : ''}`} />
              </button>
              {showBody && (
                <div className="px-4 pb-3">
                  <div className="bg-gray-950 p-3 rounded-lg overflow-x-auto">
                    <pre className="text-xs font-mono text-gray-300">
                      <code>{JSON.stringify(endpoint.body, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Parameters */}
          {endpoint.parameters && (
            <div className="border-t border-gray-700/50">
              <button
                onClick={() => setShowHeaders(!showHeaders)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/30 transition-colors"
              >
                <span className="text-sm font-medium text-gray-300">Parameters</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showHeaders ? 'rotate-180' : ''}`} />
              </button>
              {showHeaders && (
                <div className="px-4 pb-3 space-y-2">
                  {endpoint.parameters.map((param) => (
                    <div key={param.name} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-purple-400">{param.name}</code>
                        <span className="text-gray-500 text-xs">{param.type}</span>
                        {param.required && <span className="text-red-400 text-xs">required</span>}
                      </div>
                      <p className="text-gray-400 text-xs">{param.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="border-t border-gray-700/50">
          <div className="px-4 py-3 bg-gray-800/30">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium text-gray-300">Response</span>
              <div className={`px-2 py-0.5 rounded text-xs font-mono font-medium border ${getStatusColor(response.status)}`}>
                {response.status} {response.statusText}
              </div>
            </div>
            <div className="bg-gray-950 p-3 rounded-lg overflow-x-auto">
              <pre className="text-xs font-mono text-gray-300">
                <code>{JSON.stringify(response.data, null, 2)}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border-t border-gray-700/50">
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg mx-4 my-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Error</span>
            </div>
            <p className="text-xs text-red-300">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
