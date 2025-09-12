'use client'
import { useState, useEffect } from 'react'
import { Button } from '../components'
import { Card } from '../Card/Card'
import { Badge } from '../Badge/Badge'
import { Input } from '../Input/Input'

export interface TaskDependency {
  id: string
  predecessorId: string
  successorId: string
  type: 'FS' | 'SS' | 'FF' | 'SF'
  lagMinutes: number
  task?: {
    id: string
    title: string
    status: string
  }
}

interface TaskDependenciesProps {
  taskId: string
  taskTitle: string
  dependencies: {
    predecessors: TaskDependency[]
    successors: TaskDependency[]
  }
  onAddDependency: (predecessorId: string, successorId: string, type?: string) => Promise<void>
  onRemoveDependency: (predecessorId: string, successorId: string) => Promise<void>
  availableTasks: Array<{ id: string; title: string; status: string }>
  className?: string
}

const dependencyTypeLabels = {
  FS: 'Finish-to-Start',
  SS: 'Start-to-Start', 
  FF: 'Finish-to-Finish',
  SF: 'Start-to-Finish'
}

export function TaskDependencies({
  taskId,
  taskTitle,
  dependencies,
  onAddDependency,
  onRemoveDependency,
  availableTasks,
  className
}: TaskDependenciesProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [dependencyType, setDependencyType] = useState<'predecessor' | 'successor'>('predecessor')
  const [relationshipType, setRelationshipType] = useState<'FS' | 'SS' | 'FF' | 'SF'>('FS')
  const [loading, setLoading] = useState(false)

  // Filter available tasks (exclude self and already connected tasks)
  const getAvailableTasks = () => {
    const connectedTaskIds = new Set([
      taskId,
      ...dependencies.predecessors.map(dep => dep.predecessorId),
      ...dependencies.successors.map(dep => dep.successorId)
    ])
    
    return availableTasks.filter(task => !connectedTaskIds.has(task.id))
  }

  const handleAddDependency = async () => {
    if (!selectedTaskId) return

    setLoading(true)
    try {
      if (dependencyType === 'predecessor') {
        // selectedTask should finish before current task starts
        await onAddDependency(selectedTaskId, taskId, relationshipType)
      } else {
        // current task should finish before selectedTask starts
        await onAddDependency(taskId, selectedTaskId, relationshipType)
      }
      setShowAddForm(false)
      setSelectedTaskId('')
    } catch (error) {
      console.error('Failed to add dependency:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDependency = async (dep: TaskDependency) => {
    try {
      await onRemoveDependency(dep.predecessorId, dep.successorId)
    } catch (error) {
      console.error('Failed to remove dependency:', error)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Task Dependencies</h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
          disabled={getAvailableTasks().length === 0}
        >
          {showAddForm ? 'Cancel' : 'Add Dependency'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                This task depends on:
              </label>
              <div className="flex gap-2">
                <Button
                  variant={dependencyType === 'predecessor' ? 'primary' : 'outline'}
                  onClick={() => setDependencyType('predecessor')}
                  size="sm"
                >
                  Another task
                </Button>
                <Button
                  variant={dependencyType === 'successor' ? 'primary' : 'outline'}
                  onClick={() => setDependencyType('successor')}
                  size="sm"
                >
                  This task blocking
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {dependencyType === 'predecessor' ? 'Select predecessor task:' : 'Select successor task:'}
              </label>
              <select 
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Choose a task...</option>
                {getAvailableTasks().map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title} ({task.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Relationship type:
              </label>
              <select
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {Object.entries(dependencyTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleAddDependency}
                disabled={!selectedTaskId || loading}
                size="sm"
              >
                {loading ? 'Adding...' : 'Add Dependency'}
              </Button>
              <Button 
                onClick={() => setShowAddForm(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Predecessor dependencies */}
      {dependencies.predecessors.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2">Blocks this task:</h4>
          <div className="space-y-2">
            {dependencies.predecessors.map(dep => (
              <Card key={dep.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{dep.task?.title || `Task ${dep.predecessorId}`}</div>
                      <div className="text-sm text-muted-foreground">
                        {dependencyTypeLabels[dep.type]} • {dep.task?.status}
                      </div>
                    </div>
                    <Badge variant="info" className="text-xs">
                      {dep.type}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleRemoveDependency(dep)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Successor dependencies */}
      {dependencies.successors.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2">This task blocks:</h4>
          <div className="space-y-2">
            {dependencies.successors.map(dep => (
              <Card key={dep.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{dep.task?.title || `Task ${dep.successorId}`}</div>
                      <div className="text-sm text-muted-foreground">
                        {dependencyTypeLabels[dep.type]} • {dep.task?.status}
                      </div>
                    </div>
                    <Badge variant="warning" className="text-xs">
                      {dep.type}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleRemoveDependency(dep)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {dependencies.predecessors.length === 0 && dependencies.successors.length === 0 && !showAddForm && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No task dependencies defined.</p>
          <p className="text-sm text-muted-foreground">
            Dependencies help you manage task order and project flow.
          </p>
        </Card>
      )}
    </div>
  )
}