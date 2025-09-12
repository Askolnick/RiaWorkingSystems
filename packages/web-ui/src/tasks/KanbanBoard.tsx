'use client'
import { useState, useCallback } from 'react'
import { Card } from '../Card/Card'
import { Badge } from '../Badge/Badge'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  description?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  assigneeId?: string
  dueAt?: string
  rank?: string
}

export type TaskStatus = 'todo' | 'doing' | 'blocked' | 'done'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskMove?: (taskId: string, newStatus: TaskStatus, newRank?: string) => Promise<void>
  onTaskClick?: (task: Task) => void
  className?: string
}

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-gray-100' },
  doing: { label: 'In Progress', color: 'bg-blue-100' },
  blocked: { label: 'Blocked', color: 'bg-red-100' },
  done: { label: 'Done', color: 'bg-green-100' }
}

const priorityColors = {
  low: 'text-gray-500',
  normal: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500'
}

export function KanbanBoard({ tasks, onTaskMove, onTaskClick, className }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    
    if (draggedTask && draggedTask.id === taskId && draggedTask.status !== newStatus) {
      try {
        await onTaskMove?.(taskId, newStatus)
      } catch (error) {
        console.error('Failed to move task:', error)
      }
    }
    
    setDraggedTask(null)
  }, [draggedTask, onTaskMove])

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null)
  }, [])

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => (a.rank || '').localeCompare(b.rank || ''))
  }, [tasks])

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {(Object.entries(statusConfig) as [TaskStatus, typeof statusConfig[TaskStatus]][]).map(([status, config]) => (
        <div
          key={status}
          className="flex flex-col"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className={`p-3 rounded-t-lg ${config.color} border border-b-0`}>
            <h3 className="font-medium text-sm">{config.label}</h3>
            <span className="text-xs text-muted-foreground">
              {getTasksByStatus(status).length} tasks
            </span>
          </div>
          
          <Card className="flex-1 rounded-t-none min-h-96 p-2 space-y-2">
            {getTasksByStatus(status).map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
                onClick={() => onTaskClick?.(task)}
                className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                  draggedTask?.id === task.id ? 'opacity-50' : 'bg-card hover:bg-muted/5'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm line-clamp-2 flex-1">
                      {task.title}
                    </h4>
                    {task.priority && task.priority !== 'normal' && (
                      <Badge 
                        variant={task.priority === 'urgent' || task.priority === 'high' ? 'danger' : 'warning'} 
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  {task.dueAt && (
                    <div className="text-xs text-muted-foreground">
                      Due: {new Date(task.dueAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  )
}