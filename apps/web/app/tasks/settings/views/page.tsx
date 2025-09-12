'use client';

import { useEffect } from 'react';
import { useTasksStore } from '@ria/client';
import { SavedViewsManager } from '@ria/web-ui';

export default function TasksViewsPage() {
  const {
    savedViews,
    currentView,
    defaultView,
    savedViewsLoading,
    error,
    fetchSavedViews,
    createSavedView,
    updateSavedView,
    deleteSavedView,
    setCurrentView,
    setDefaultView,
    clearError
  } = useTasksStore();

  useEffect(() => {
    fetchSavedViews();
  }, [fetchSavedViews]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  return (
    <div className="container mx-auto px-4 py-8">
      <SavedViewsManager
        savedViews={savedViews}
        currentView={currentView}
        defaultView={defaultView}
        loading={savedViewsLoading}
        error={error}
        onCreateView={createSavedView}
        onUpdateView={updateSavedView}
        onDeleteView={deleteSavedView}
        onSetCurrentView={setCurrentView}
        onSetDefaultView={setDefaultView}
      />
    </div>
  );
}