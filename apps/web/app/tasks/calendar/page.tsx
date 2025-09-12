'use client';

import { useEffect } from 'react';
import { useTasksStore } from '@ria/client';
import { CalendarView, ViewToolbar } from '@ria/web-ui';

export default function TasksCalendarPage() {
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

  const handleDateClick = (date: Date) => {
    // Could open a "create task for this date" modal
    console.log('Date clicked:', date);
  };

  const handleManageViews = () => {
    // Navigate to views management page
    window.location.href = '/tasks/settings/views';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks Calendar</h1>
        <p className="text-gray-600">
          View and manage your tasks in a calendar format organized by due dates.
        </p>
      </div>

      {/* View Controls */}
      <div className="mb-6">
        <ViewToolbar
          savedViews={savedViews.filter(view => view.viewType === 'calendar')}
          currentView={currentView?.viewType === 'calendar' ? currentView : null}
          onViewChange={(view) => setCurrentView(view)}
          onManageViews={handleManageViews}
        />
      </div>

      {/* Calendar View */}
      <CalendarView
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onStatusChange={handleStatusChange}
        onDateClick={handleDateClick}
      />
    </div>
  );
}