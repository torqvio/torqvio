'use client'

import { useState } from 'react'
import { User, Bell, Shield, Palette, Globe, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'workspace', name: 'Workspace', icon: Globe },
    { id: 'api', name: 'API Keys', icon: Database },
  ]

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
