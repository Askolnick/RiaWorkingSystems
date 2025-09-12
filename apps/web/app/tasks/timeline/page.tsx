'use client';

import { useEffect } from 'react';
import { useTasksStore } from '@ria/client';
import { TimelineView, ViewToolbar } from '@ria/web-ui';

export default function TasksTimelinePage() {
  const {
    tasks,
    loading,
    error,
    savedViews,
    currentView,
    savedViewsLoading,
    fetchTasks,
    fetchSavedViews,
    setCurrentView,
    moveTask,
    clearError
  } = useTasksStore();

  useEffect(() => {
    fetchTasks();
    fetchSavedViews();
  }, [fetchTasks, fetchSavedViews]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleTaskClick = (task: any) => {
    // Could open task details modal or navigate to task page
    console.log('Task clicked:', task);
  };

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    try {
      await moveTask(taskId, newStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleManageViews = () => {
    // Navigate to views management page
    window.location.href = '/tasks/settings/views';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks Timeline</h1>
        <p className="text-gray-600">
          View your tasks organized chronologically by creation date, due date, or completion.
        </p>
      </div>

      {/* View Controls */}
      <div className="mb-6">
        <ViewToolbar
          savedViews={savedViews.filter(view => view.viewType === 'timeline')}
          currentView={currentView?.viewType === 'timeline' ? currentView : null}
          onViewChange={(view) => setCurrentView(view)}
          onManageViews={handleManageViews}
        />
      </div>

      {/* Timeline View */}
      <TimelineView
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}