'use client'

import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function WorkflowStats() {
  const stats = [
    {
      name: 'Total Executions',
      value: '2,595',
      change: '+12%',
      changeType: 'positive',
      icon: Activity,
    },
    {
      name: 'Failed Executions',
      value: '23',
      change: '-8%',
      changeType: 'positive',
      icon: XCircle,
    },
    {
      name: 'Success Rate',
      value: '99.1%',
      change: '+0.3%',
      changeType: 'positive',
      icon: CheckCircle,
    },
    {
      name: 'Avg Duration',
      value: '2.4s',
      change: '-15%',
      changeType: 'positive',
      icon: Clock,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {stats.map((stat) => (
        <Card key={stat.name} className="hover:shadow-md transition-all duration-200 min-w-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-secondary truncate">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  {stat.value}
                </p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'positive' ? 'text-success' : 'text-error'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className="w-12 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
