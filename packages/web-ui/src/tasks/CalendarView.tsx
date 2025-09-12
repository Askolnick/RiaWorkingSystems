'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/atoms/Card';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import type { Task, TaskStatus } from './KanbanBoard';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onDateClick?: (date: Date) => void;
  className?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

const STATUS_VARIANTS: Record<TaskStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  todo: 'neutral',
  doing: 'info',
  blocked: 'danger',
  done: 'success'
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CalendarView({
  tasks,
  onTaskClick,
  onStatusChange,
  onDateClick,
  className = ''
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'week'>('month');

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and calculate starting date
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    const endDate = new Date(lastDayOfMonth);
    
    // Adjust to show full weeks
    startDate.setDate(startDate.getDate() - startDate.getDay());
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayTasks = tasks.filter(task => {
        if (!task.dueAt) return false;
        const taskDate = new Date(task.dueAt);
        return (
          taskDate.getFullYear() === current.getFullYear() &&
          taskDate.getMonth() === current.getMonth() &&
          taskDate.getDate() === current.getDate()
        );
      });
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: isToday(current),
        tasks: dayTasks
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate, tasks]);

  const weekDays = useMemo(() => {
    if (viewType !== 'week') return [];
    
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days: CalendarDay[] = [];
    const current = new Date(startOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const dayTasks = tasks.filter(task => {
        if (!task.dueAt) return false;
        const taskDate = new Date(task.dueAt);
        return (
          taskDate.getFullYear() === current.getFullYear() &&
          taskDate.getMonth() === current.getMonth() &&
          taskDate.getDate() === current.getDate()
        );
      });
      
      days.push({
        date: new Date(current),
        isCurrentMonth: true,
        isToday: isToday(current),
        tasks: dayTasks
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate, tasks, viewType]);

  function isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  function isOverdue(task: Task): boolean {
    if (!task.dueAt) return false;
    const now = new Date();
    const taskDate = new Date(task.dueAt);
    return taskDate < now && task.status !== 'done';
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (viewType === 'month') {
      navigateMonth(direction);
    } else {
      navigateWeek(direction);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateHeader = () => {
    if (viewType === 'month') {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${MONTHS[startOfWeek.getMonth()]} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      } else {
        return `${MONTHS[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${MONTHS[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      }
    }
  };

  const displayDays = viewType === 'month' ? calendarDays : weekDays;

  const renderTask = (task: Task, isCompact: boolean = false) => (
    <div
      key={task.id}
      className={`p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${
        isOverdue(task) ? 'bg-red-100 border border-red-300' : 'bg-blue-100 border border-blue-300'
      } ${isCompact ? 'mb-1' : 'mb-2'}`}
      onClick={(e) => {
        e.stopPropagation();
        onTaskClick?.(task);
      }}
    >
      <div className="flex items-center justify-between">
        <span className={`font-medium truncate ${isOverdue(task) ? 'text-red-800' : 'text-blue-800'}`}>
          {task.title}
        </span>
        {!isCompact && (
          <Badge variant={STATUS_VARIANTS[task.status]} size="xs">
            {task.status === 'todo' ? 'Todo' : task.status === 'doing' ? 'Doing' : task.status === 'blocked' ? 'Blocked' : 'Done'}
          </Badge>
        )}
      </div>
      {!isCompact && task.description && (
        <div className="text-gray-600 mt-1 truncate">
          {task.description}
        </div>
      )}
    </div>
  );

  const renderDay = (day: CalendarDay) => {
    const dayNumber = day.date.getDate();
    const hasOverdue = day.tasks.some(task => isOverdue(task));
    
    return (
      <div
        key={day.date.toISOString()}
        className={`border border-gray-200 min-h-24 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
          !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
        } ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}`}
        onClick={() => onDateClick?.(day.date)}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${
            day.isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {dayNumber}
          </span>
          {day.tasks.length > 0 && (
            <span className={`text-xs px-1 py-0.5 rounded-full ${
              hasOverdue ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {day.tasks.length}
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          {day.tasks.slice(0, viewType === 'month' ? 3 : 8).map(task => 
            renderTask(task, viewType === 'month')
          )}
          {day.tasks.length > (viewType === 'month' ? 3 : 8) && (
            <div className="text-xs text-gray-500 text-center">
              +{day.tasks.length - (viewType === 'month' ? 3 : 8)} more
            </div>
          )}
        </div>
      </div>
    );
  };

  const todaysTasks = useMemo(() => {
    const today = new Date();
    return tasks.filter(task => {
      if (!task.dueAt) return false;
      const taskDate = new Date(task.dueAt);
      return (
        taskDate.getFullYear() === today.getFullYear() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getDate() === today.getDate()
      );
    });
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks.filter(task => {
      if (!task.dueAt) return false;
      const taskDate = new Date(task.dueAt);
      return taskDate > today && taskDate <= nextWeek;
    }).sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    return tasks.filter(task => isOverdue(task));
  }, [tasks]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">{formatDateHeader()}</h2>
          <div className="flex items-center space-x-1">
            <Button variant="secondary" size="sm" onClick={() => navigate('prev')}>
              ←
            </Button>
            <Button variant="secondary" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('next')}>
              →
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week'] as const).map(view => (
              <button
                key={view}
                onClick={() => setViewType(view)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewType === view
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view === 'month' ? 'Month' : 'Week'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {displayDays.map(renderDay)}
        </div>
      </div>

      {/* Side panels */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks ({todaysTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks due today</p>
            ) : (
              <div className="space-y-2">
                {todaysTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{task.title}</span>
                      <Badge variant={STATUS_VARIANTS[task.status]} size="xs">
                        {task.status}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-600 mt-1 truncate">{task.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming (Next 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming tasks</p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.slice(0, 5).map(task => (
                  <div
                    key={task.id}
                    className="p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{task.title}</span>
                      <Badge variant={STATUS_VARIANTS[task.status]} size="xs">
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {task.description && (
                        <p className="text-xs text-gray-600 truncate flex-1">{task.description}</p>
                      )}
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(task.dueAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingTasks.length > 5 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{upcomingTasks.length - 5} more upcoming
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Overdue ({overdueTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No overdue tasks</p>
            ) : (
              <div className="space-y-2">
                {overdueTasks.slice(0, 5).map(task => (
                  <div
                    key={task.id}
                    className="p-2 border border-red-200 bg-red-50 rounded cursor-pointer hover:bg-red-100"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-red-800">{task.title}</span>
                      <Badge variant="danger" size="xs">
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {task.description && (
                        <p className="text-xs text-red-600 truncate flex-1">{task.description}</p>
                      )}
                      <span className="text-xs text-red-500 ml-2">
                        {new Date(task.dueAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {overdueTasks.length > 5 && (
                  <div className="text-xs text-red-500 text-center">
                    +{overdueTasks.length - 5} more overdue
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}