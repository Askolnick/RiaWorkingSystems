'use client';

import { useEffect } from 'react';
import { useTasksStore, createEntityRef } from '@ria/client';
import { ListView, ViewToolbar, QuickLinkButton } from '@ria/web-ui';

export default function TasksListPage() {
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
    // Navigate to task details page
    window.location.href = `/tasks/${task.id}`;
  };
  
  const handleQuickLink = (task: any) => {
    // Create entity reference for the task
    const taskEntity = createEntityRef('task', task.id, task.tenantId || 'default');
    return taskEntity;
  };

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    try {
      await moveTask(taskId, newStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleBulkStatusChange = async (taskIds: string[], newStatus: any) => {
    try {
      // For now, update each task individually
      for (const taskId of taskIds) {
        await moveTask(taskId, newStatus);
      }
    } catch (error) {
      console.error('Failed to update tasks status:', error);
    }
  };

  const handleDeleteTasks = async (taskIds: string[]) => {
    // TODO: Implement bulk delete functionality
    console.log('Delete tasks:', taskIds);
  };

  const handleManageViews = () => {
    // Navigate to views management page
    window.location.href = '/tasks/settings/views';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks List</h1>
        <p className="text-gray-600">
          Manage your tasks in a detailed list format with advanced filtering and sorting options.
        </p>
      </div>

      {/* View Controls */}
      <div className="mb-6">
        <ViewToolbar
          savedViews={savedViews.filter(view => view.viewType === 'list')}
          currentView={currentView?.viewType === 'list' ? currentView : null}
          onViewChange={(view) => setCurrentView(view)}
          onManageViews={handleManageViews}
        />
      </div>

      {/* List View */}
      <ListView
        tasks={tasks}
        loading={loading}
        error={error}
        onTaskClick={handleTaskClick}
        onStatusChange={handleStatusChange}
        onBulkStatusChange={handleBulkStatusChange}
        onDeleteTasks={handleDeleteTasks}
      />
    </div>
  );
}