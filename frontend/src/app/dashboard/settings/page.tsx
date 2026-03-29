'use client'

import { useState } from 'react'
import { User, Bell, Shield, Palette, Globe, Database, Brain, AlertTriangle, CheckCircle, TrendingUp, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TrustRecommendation {
  id: string
  type: 'risk' | 'compliance' | 'security'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  recommendation: string
  impact: string
  confidence: number
  autoFixAvailable: boolean
  estimatedTime: string
  priority: number
}

interface SecurityMetrics {
  riskScore: number
  complianceScore: number
  securityScore: number
  lastAssessment: string
  issuesCount: number
  autoFixedCount: number
}

const TRUST_RECOMMENDATIONS: TrustRecommendation[] = [
  {
    id: 'trust_001',
    type: 'security',
    severity: 'high',
    title: 'API Key Exposure Risk',
    description: 'API keys with broad permissions detected in workflow configurations.',
    recommendation: 'Implement principle of least privilege with scoped keys',
    impact: 'Reduce security risk by 78%',
    confidence: 94,
    autoFixAvailable: true,
    estimatedTime: '5 min',
    priority: 1
  },
  {
    id: 'trust_002',
    type: 'compliance',
    severity: 'medium',
    title: 'GDPR Data Processing Gap',
    description: 'Personal data processing workflows lack proper consent tracking.',
    recommendation: 'Add consent management and data processing records',
    impact: 'Achieve GDPR compliance automatically',
    confidence: 87,
    autoFixAvailable: true,
    estimatedTime: '10 min',
    priority: 2
  },
  {
    id: 'trust_003',
    type: 'risk',
    severity: 'low',
    title: 'Insufficient Audit Trail',
    description: 'Some critical workflows lack comprehensive audit logging.',
    recommendation: 'Enable detailed audit logging for all compliance workflows',
    impact: 'Improve audit readiness by 45%',
    confidence: 82,
    autoFixAvailable: true,
    estimatedTime: '3 min',
    priority: 3
  }
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showTrustIntelligence, setShowTrustIntelligence] = useState(true)
  const [recommendations] = useState<TrustRecommendation[]>(TRUST_RECOMMENDATIONS)
  const [securityMetrics] = useState<SecurityMetrics>({
    riskScore: 72,
    complianceScore: 85,
    securityScore: 91,
    lastAssessment: '2 hours ago',
    issuesCount: 3,
    autoFixedCount: 12
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'workspace', name: 'Workspace', icon: Globe },
    { id: 'api', name: 'API Keys', icon: Database },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleApplyRecommendation = (recommendationId: string) => {
    const recommendation = recommendations.find(r => r.id === recommendationId)
    if (!recommendation) return
    
    console.log('Applying trust recommendation:', recommendation.title)
    // In real app, this would trigger auto-fix
  };

  const handleDismissRecommendation = (recommendationId: string) => {
    console.log('Dismissing trust recommendation:', recommendationId)
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary">Manage your account and workspace settings</p>
      </div>

      <div className="flex space-x-1 bg-surface rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tabs.find(t => t.id === activeTab)?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary"
                />
              </div>
              <Button>Save Changes</Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-text-primary">Email notifications for workflow failures</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-text-primary">Webhook delivery notifications</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-text-primary">Weekly performance reports</span>
              </label>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Trust Intelligence Toggle */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-text-primary">Trust as a Feature</h3>
                <button
                  onClick={() => setShowTrustIntelligence(!showTrustIntelligence)}
                  className={`flex items-center gap-1.5 h-8 px-3 text-xs rounded-md transition-colors ${
                    showTrustIntelligence 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30' 
                      : 'bg-surface border border-border text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span>Trust AI</span>
                  {recommendations.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </button>
              </div>

              {/* Security Metrics Dashboard */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-surface border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-muted">Risk Score</span>
                    <Shield className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getScoreColor(securityMetrics.riskScore)}`}
                        style={{ width: `${securityMetrics.riskScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono text-white">{securityMetrics.riskScore}%</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-surface border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-muted">Compliance</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getScoreColor(securityMetrics.complianceScore)}`}
                        style={{ width: `${securityMetrics.complianceScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono text-white">{securityMetrics.complianceScore}%</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-surface border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-muted">Security</span>
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getScoreColor(securityMetrics.securityScore)}`}
                        style={{ width: `${securityMetrics.securityScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono text-white">{securityMetrics.securityScore}%</span>
                  </div>
                </div>
              </div>

              {/* Trust Intelligence Panel */}
              {showTrustIntelligence && recommendations.length > 0 && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">Trust Intelligence</span>
                      <span className="text-xs text-gray-400">{recommendations.length} recommendation{recommendations.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Last assessment: {securityMetrics.lastAssessment}</span>
                      <span>Auto-fixed: {securityMetrics.autoFixedCount}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((rec) => (
                      <div key={rec.id} className="flex items-start gap-3 p-3 rounded bg-[#1A1F2E]/50 border border-gray-700/50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`w-4 h-4 ${
                              rec.severity === 'high' ? 'text-red-400' :
                              rec.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                            }`} />
                            <span className="text-sm font-medium text-white">{rec.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(rec.severity)}`}>
                              {rec.severity}
                            </span>
                            <span className="text-xs text-gray-400">{rec.confidence}% confidence</span>
                          </div>
                          
                          <p className="text-xs text-gray-400 mb-2">{rec.description}</p>
                          
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-400" />
                              <span className="text-xs text-green-400">{rec.impact}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-yellow-400">{rec.estimatedTime}</span>
                            </div>
                            {rec.autoFixAvailable && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-blue-400" />
                                <span className="text-xs text-blue-400">Auto-fix available</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-purple-400 mb-1">Recommended action:</p>
                              <p className="text-xs text-gray-300">{rec.recommendation}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDismissRecommendation(rec.id)}
                                className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => handleApplyRecommendation(rec.id)}
                                className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
                              >
                                {rec.autoFixAvailable && <Zap className="w-3 h-3" />}
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Traditional Security Settings */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-text-primary mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Current password"
                      className="w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className="w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary"
                    />
                    <Button>Update Password</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-4">Theme</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="theme" defaultChecked className="rounded" />
                    <span className="text-text-primary">Dark (Default)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="theme" className="rounded" />
                    <span className="text-text-primary">Light</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="radio" name="theme" className="rounded" />
                    <span className="text-text-primary">System</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-4">Workspace Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Production"
                      className="w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Timezone
                    </label>
                    <select className="w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary">
                      <option>UTC</option>
                      <option>America/New_York</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-text-primary">API Keys</h3>
                <Button>Create New Key</Button>
              </div>
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-text-primary">Production Key</p>
                      <p className="text-sm text-text-secondary font-mono">af_prod_...</p>
                    </div>
                    <span className="status-success">Active</span>
                  </div>
                  <p className="text-sm text-text-secondary">Created 30 days ago</p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-text-primary">Development Key</p>
                      <p className="text-sm text-text-secondary font-mono">af_dev_...</p>
                    </div>
                    <span className="status-success">Active</span>
                  </div>
                  <p className="text-sm text-text-secondary">Created 60 days ago</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
