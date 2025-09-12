'use client'
import { useEffect } from 'react'
import { useTasksStore } from '@ria/client'
import { KanbanBoard, LoadingCard, Alert, ErrorBoundary } from '@ria/web-ui'

export default function TasksBoardPage() {
  const {
    tasks,
    tasksByStatus,
    loading,
    error,
    moveLoading,
    fetchTasks,
    moveTask,
    setCurrentTask,
    clearError
  } = useTasksStore()

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    await moveTask(taskId, newStatus as any)
  }

  const handleTaskClick = (task: any) => {
    setCurrentTask(task)
  }

  if (loading) {
    return <LoadingCard />
  }

  if (error) {
    return (
      <Alert type="error" onClose={clearError}>
        {error}
      </Alert>
    )
  }

  return (
    <ErrorBoundary>
      <main className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold">Kanban Board</h1>
          <p className="text-gray-600">
            Drag and drop tasks to update their status and track progress across your workflow.
          </p>
        </div>
        
        <KanbanBoard 
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskClick={handleTaskClick}
          loading={loading}
        />
        
        <div className="mt-8 p-4 rounded-lg bg-gray-50 border">
          <p className="text-sm text-gray-600">
            💡 <strong>Features:</strong> Drag-and-drop task management with automatic rank ordering, 
            priority indicators, and due date tracking. Click tasks for more details.
          </p>
        </div>
      </main>
    </ErrorBoundary>
  )
}