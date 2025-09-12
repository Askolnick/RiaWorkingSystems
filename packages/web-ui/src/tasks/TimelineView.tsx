'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/atoms/Card';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import type { Task, TaskStatus } from './KanbanBoard';

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  className?: string;
}

interface TimelineEvent {
  date: string;
  tasks: Task[];
  type: 'created' | 'due' | 'completed';
}

const STATUS_VARIANTS: Record<TaskStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  todo: 'neutral',
  doing: 'info',
  blocked: 'danger',
  done: 'success'
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  doing: 'In Progress',
  blocked: 'Blocked',
  done: 'Done'
};

export function TimelineView({
  tasks,
  onTaskClick,
  onStatusChange,
  className = ''
}: TimelineViewProps) {
  const [timelineView, setTimelineView] = useState<'created' | 'due' | 'mixed'>('due');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month');

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    const eventMap = new Map<string, TimelineEvent>();

    tasks.forEach(task => {
      // For timeline view, we'll primarily use due dates since that's what's available in Task interface
      if (timelineView === 'due' || timelineView === 'mixed') {
        if (task.dueAt) {
          const dateKey = new Date(task.dueAt).toDateString();
          if (!eventMap.has(`due-${dateKey}`)) {
            eventMap.set(`due-${dateKey}`, {
              date: dateKey,
              tasks: [],
              type: 'due'
            });
          }
          eventMap.get(`due-${dateKey}`)!.tasks.push(task);
        }
      }

      // For created view, since we don't have createdAt, we'll group tasks without due dates
      if (timelineView === 'created') {
        if (!task.dueAt) {
          const today = new Date().toDateString();
          if (!eventMap.has(`created-${today}`)) {
            eventMap.set(`created-${today}`, {
              date: today,
              tasks: [],
              type: 'created'
            });
          }
          eventMap.get(`created-${today}`)!.tasks.push(task);
        }
      }

      // Add completed events for done tasks (use today's date as placeholder)
      if (task.status === 'done' && (timelineView === 'mixed' || timelineView === 'created')) {
        const today = new Date().toDateString();
        if (!eventMap.has(`completed-${today}`)) {
          eventMap.set(`completed-${today}`, {
            date: today,
            tasks: [],
            type: 'completed'
          });
        }
        eventMap.get(`completed-${today}`)!.tasks.push(task);
      }
    });

    // Convert to array and sort by date (newest first)
    const sortedEvents = Array.from(eventMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date(now);
      
      switch (timeRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
      }

      return sortedEvents.filter(event => 
        new Date(event.date) >= cutoffDate
      );
    }

    return sortedEvents;
  }, [tasks, timelineView, timeRange]);

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created': return '✨';
      case 'due': return '⏰';
      case 'completed': return '✅';
      default: return '📌';
    }
  };

  const getEventTitle = (type: TimelineEvent['type'], tasksCount: number) => {
    switch (type) {
      case 'created': return `${tasksCount} task${tasksCount > 1 ? 's' : ''} created`;
      case 'due': return `${tasksCount} task${tasksCount > 1 ? 's' : ''} due`;
      case 'completed': return `${tasksCount} task${tasksCount > 1 ? 's' : ''} completed`;
      default: return `${tasksCount} task${tasksCount > 1 ? 's' : ''}`;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueAt) return false;
    const now = new Date();
    return new Date(task.dueAt) < now && task.status !== 'done';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['due', 'created', 'mixed'] as const).map(view => (
              <button
                key={view}
                onClick={() => setTimelineView(view)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timelineView === view
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view === 'due' ? 'Due Dates' : view === 'created' ? 'Created' : 'Mixed'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Range:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'quarter', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === 'all' ? 'All' : range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline events */}
        <div className="space-y-8">
          {timelineEvents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">No tasks found for the selected time range</p>
                <Button onClick={() => setTimeRange('all')}>
                  Show All Tasks
                </Button>
              </CardContent>
            </Card>
          ) : (
            timelineEvents.map((event, eventIndex) => (
              <div key={`${event.type}-${event.date}`} className="relative flex">
                {/* Timeline marker */}
                <div className="absolute left-6 w-4 h-4 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs">{getEventIcon(event.type)}</span>
                </div>

                {/* Event content */}
                <div className="ml-16 flex-1">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatDate(event.date)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getEventTitle(event.type, event.tasks.length)}
                    </p>
                  </div>

                  {/* Tasks for this event */}
                  <div className="space-y-3">
                    {event.tasks.map(task => (
                      <Card 
                        key={task.id} 
                        className={`cursor-pointer hover:shadow-md transition-shadow ${
                          isOverdue(task) ? 'border-red-200 bg-red-50' : ''
                        }`}
                        onClick={() => onTaskClick?.(task)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {task.title}
                                </h4>
                                {isOverdue(task) && (
                                  <Badge variant="danger" size="sm">
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                {task.dueAt && (
                                  <span>Due {new Date(task.dueAt).toLocaleDateString()}</span>
                                )}
                                {task.assigneeId && (
                                  <span>Assigned</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Badge variant={STATUS_VARIANTS[task.status]}>
                                {STATUS_LABELS[task.status]}
                              </Badge>
                              
                              {task.priority && (
                                <Badge variant="neutral">
                                  {task.priority}
                                </Badge>
                              )}

                              {onStatusChange && (
                                <div className="flex space-x-1">
                                  {task.status !== 'done' && (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onStatusChange(task.id, 'done');
                                      }}
                                    >
                                      Mark Done
                                    </Button>
                                  )}
                                  {task.status === 'done' && (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onStatusChange(task.id, 'todo');
                                      }}
                                    >
                                      Reopen
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary */}
      {timelineEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => timelineView === 'created' ? !t.dueAt : t.dueAt).length}
                </div>
                <div className="text-sm text-gray-600">
                  {timelineView === 'created' ? 'Created' : 'With Dates'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {tasks.filter(t => isOverdue(t)).length}
                </div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'done').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {tasks.filter(t => t.status !== 'done').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}