'use client';

import React, { useState } from 'react';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import type { TaskSavedView } from '@ria/tasks-server';

interface ViewSelectorProps {
  savedViews: TaskSavedView[];
  currentView: TaskSavedView | null;
  onViewChange: (view: TaskSavedView | null) => void;
  className?: string;
}

export function ViewSelector({
  savedViews,
  currentView,
  onViewChange,
  className = ''
}: ViewSelectorProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const viewOptions = [
    { value: '', label: 'Default View' },
    ...savedViews.map(view => ({
      value: view.id,
      label: view.name
    }))
  ];

  const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const viewId = e.target.value;
    if (viewId === '') {
      onViewChange(null);
    } else {
      const view = savedViews.find(v => v.id === viewId);
      onViewChange(view || null);
    }
  };

  const getDefaultView = () => {
    return savedViews.find(view => view.isDefault) || null;
  };

  const handleUseDefault = () => {
    const defaultView = getDefaultView();
    onViewChange(defaultView);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex-1">
        <Select
          options={viewOptions}
          value={currentView?.id || ''}
          onChange={handleViewChange}
          className="w-full"
        />
      </div>
      
      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowQuickActions(!showQuickActions)}
        >
          ⚙️
        </Button>
        
        {showQuickActions && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
            <div className="p-2">
              <button
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => {
                  handleUseDefault();
                  setShowQuickActions(false);
                }}
                disabled={!getDefaultView()}
              >
                Use Default View
              </button>
              
              <button
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => {
                  onViewChange(null);
                  setShowQuickActions(false);
                }}
              >
                Clear View
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside to close */}
      {showQuickActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowQuickActions(false)}
        />
      )}
    </div>
  );
}

interface QuickViewButtonProps {
  view: TaskSavedView;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function QuickViewButton({
  view,
  isActive,
  onClick,
  className = ''
}: QuickViewButtonProps) {
  return (
    <Button
      variant={isActive ? "primary" : "secondary"}
      size="sm"
      onClick={onClick}
      className={className}
    >
      {view.name}
      {view.isDefault && (
        <span className="ml-1 text-xs opacity-75">★</span>
      )}
    </Button>
  );
}

interface ViewToolbarProps {
  savedViews: TaskSavedView[];
  currentView: TaskSavedView | null;
  onViewChange: (view: TaskSavedView | null) => void;
  onManageViews?: () => void;
  className?: string;
}

export function ViewToolbar({
  savedViews,
  currentView,
  onViewChange,
  onManageViews,
  className = ''
}: ViewToolbarProps) {
  const popularViews = savedViews.filter(view => 
    view.isDefault || view.isShared
  ).slice(0, 4);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Views:</span>
        
        {popularViews.map(view => (
          <QuickViewButton
            key={view.id}
            view={view}
            isActive={currentView?.id === view.id}
            onClick={() => onViewChange(view)}
          />
        ))}
        
        {currentView && !popularViews.find(v => v.id === currentView.id) && (
          <QuickViewButton
            view={currentView}
            isActive={true}
            onClick={() => {}}
          />
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <ViewSelector
          savedViews={savedViews}
          currentView={currentView}
          onViewChange={onViewChange}
          className="w-48"
        />
        
        {onManageViews && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onManageViews}
          >
            Manage Views
          </Button>
        )}
      </div>
    </div>
  );
}