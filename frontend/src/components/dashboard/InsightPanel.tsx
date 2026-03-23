'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface InsightPanelProps {
  score: number
  recommendations: string[]
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
}

export function InsightPanel({ score, recommendations, systemHealth }: InsightPanelProps) {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-success bg-success/10 border-success/20'
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'warning': return 'text-warning bg-warning/10 border-warning/20'
      case 'critical': return 'text-error bg-error/10 border-error/20'
      default: return 'text-text-muted bg-surface border-border'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />
      case 'good': return <TrendingUp className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-warning'
    return 'text-error'
  }

  return (
    <Card className="bg-surface border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg font-semibold text-text-primary">System Insights</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 flex-1 flex flex-col">
        {/* System Health Score */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary mr-3" />
            <div>
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-sm text-text-secondary">Health Score</div>
            </div>
          </div>
          
          <Progress value={score} className="h-2 mb-2" />
          
          <Badge className={`mb-4 ${getHealthColor(systemHealth)}`}>
            <div className="flex items-center gap-1">
              {getHealthIcon(systemHealth)}
              <span className="capitalize">{systemHealth}</span>
            </div>
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-surface-light rounded-lg">
            <div className="text-lg font-semibold text-text-primary">94%</div>
            <div className="text-xs text-text-secondary">Success Rate</div>
          </div>
          <div className="text-center p-3 bg-surface-light rounded-lg">
            <div className="text-lg font-semibold text-text-primary">1.2s</div>
            <div className="text-xs text-text-secondary">Avg Response</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-text-primary">Recommendations</h4>
          </div>
          
          <div className="space-y-2 flex-1">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-3 bg-surface-light rounded-lg text-sm text-text-secondary leading-relaxed"
              >
                {rec}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white">
            View Detailed Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
