'use client'

import { useState, useEffect } from 'react'
import { usePortalStore } from '@ria/client'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, LoadingCard, Alert } from '@ria/web-ui'
import { Plus, Settings, LayoutGrid, BarChart3, Users, FileText } from 'lucide-react'

export default function PortalDashboard() {
  const {
    widgets,
    loading,
    error,
    loadLayout,
    clearError
  } = usePortalStore()
  
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  useEffect(() => {
    loadLayout()
  }, [loadLayout])

  if (loading) {
    return <LoadingCard />
  }

  if (error) {
    return (
      <Alert type="error">
        {error}
        <Button onClick={clearError} variant="ghost" size="sm" className="ml-4">
          Dismiss
        </Button>
      </Alert>
    )
  }

  // Default dashboard modules/widgets
  const modules = [
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Manage your tasks and projects',
      icon: LayoutGrid,
      color: 'bg-blue-500',
      stats: { open: 12, completed: 48, total: 60 }
    },
    {
      id: 'finance',
      title: 'Finance',
      description: 'Track invoices and expenses',
      icon: BarChart3,
      color: 'bg-green-500',
      stats: { pending: 5, paid: 23, total: 28 }
    },
    {
      id: 'contacts',
      title: 'Contacts',
      description: 'Manage customer relationships',
      icon: Users,
      color: 'bg-purple-500',
      stats: { active: 156, new: 12, total: 168 }
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Documents and knowledge base',
      icon: FileText,
      color: 'bg-orange-500',
      stats: { documents: 234, wikis: 15, total: 249 }
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portal Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's an overview of your workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Card 
              key={module.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedModule(module.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${module.color} bg-opacity-10`}>
                    <Icon className={`h-5 w-5 ${module.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="text-2xl font-bold">
                    {module.stats.total}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">{module.title}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {module.description}
                </CardDescription>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  {Object.entries(module.stats).filter(([key]) => key !== 'total').map(([key, value]) => (
                    <span key={key}>
                      {key}: <strong>{value}</strong>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates across all modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: '2 hours ago', action: 'Invoice #1234 marked as paid', module: 'Finance' },
                { time: '4 hours ago', action: 'New task "Update documentation" created', module: 'Tasks' },
                { time: 'Yesterday', action: 'Contact "John Doe" added', module: 'Contacts' },
                { time: 'Yesterday', action: 'Wiki page "Getting Started" updated', module: 'Library' },
                { time: '2 days ago', action: 'Project "Website Redesign" completed', module: 'Tasks' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{activity.module}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Module Details */}
      {selectedModule && (
        <Card>
          <CardHeader>
            <CardTitle>
              {modules.find(m => m.id === selectedModule)?.title} Details
            </CardTitle>
            <CardDescription>
              More information about {modules.find(m => m.id === selectedModule)?.title.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Click on any module card above to see more details here. 
              This section will show relevant information and quick actions for the selected module.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setSelectedModule(null)}
            >
              Close Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}