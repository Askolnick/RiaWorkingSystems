'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/atoms/Card';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { Table } from '../components/atoms/Table';
import type { Task, TaskStatus } from './KanbanBoard';

interface ListViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onBulkStatusChange?: (taskIds: string[], newStatus: TaskStatus) => void;
  onDeleteTasks?: (taskIds: string[]) => void;
  className?: string;
}

type SortField = 'title' | 'status' | 'priority' | 'dueAt' | 'assigneeId';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface FilterConfig {
  status: TaskStatus | 'all';
  priority: string | 'all';
  assigneeId: string | 'all';
  search: string;
  dueDateRange: 'all' | 'today' | 'thisWeek' | 'overdue';
}

const STATUS_VARIANTS: Record<TaskStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  todo: 'neutral',
  doing: 'info',
  blocked: 'danger',
  done: 'success'
};

const PRIORITY_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  low: 'neutral',
  normal: 'info',
  high: 'warning',
  urgent: 'danger'
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'doing', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' }
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const DUE_DATE_OPTIONS = [
  { value: 'all', label: 'All Dates' },
  { value: 'today', label: 'Due Today' },
  { value: 'thisWeek', label: 'Due This Week' },
  { value: 'overdue', label: 'Overdue' }
];

export function ListView({
  tasks,
  onTaskClick,
  onStatusChange,
  onBulkStatusChange,
  onDeleteTasks,
  className = ''
}: ListViewProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'dueAt', direction: 'asc' });
  const [filters, setFilters] = useState<FilterConfig>({
    status: 'all',
    priority: 'all',
    assigneeId: 'all',
    search: '',
    dueDateRange: 'all'
  });

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Status filter
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // Assignee filter
      if (filters.assigneeId !== 'all' && task.assigneeId !== filters.assigneeId) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchTerm);
        const matchesDescription = task.description?.toLowerCase().includes(searchTerm);
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }

      // Due date range filter
      if (filters.dueDateRange !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);

        switch (filters.dueDateRange) {
          case 'today':
            if (!task.dueAt) return false;
            const taskDate = new Date(task.dueAt);
            const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
            if (taskDateOnly.getTime() !== today.getTime()) return false;
            break;
          case 'thisWeek':
            if (!task.dueAt) return false;
            const dueDate = new Date(task.dueAt);
            if (dueDate < today || dueDate > weekFromNow) return false;
            break;
          case 'overdue':
            if (!task.dueAt) return false;
            const overdueDate = new Date(task.dueAt);
            if (overdueDate >= today || task.status === 'done') return false;
            break;
        }
      }

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.field];
      let bValue: any = b[sortConfig.field];

      // Handle different field types
      if (sortConfig.field === 'dueAt') {
        aValue = aValue ? new Date(aValue).getTime() : Infinity;
        bValue = bValue ? new Date(bValue).getTime() : Infinity;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [tasks, filters, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(filteredAndSortedTasks.map(task => task.id)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  const handleBulkAction = (action: 'status' | 'delete', value?: TaskStatus) => {
    const taskIds = Array.from(selectedTasks);
    if (taskIds.length === 0) return;

    if (action === 'status' && value && onBulkStatusChange) {
      onBulkStatusChange(taskIds, value);
    } else if (action === 'delete' && onDeleteTasks) {
      onDeleteTasks(taskIds);
    }

    setSelectedTasks(new Set());
  };

  const isOverdue = (task: Task): boolean => {
    if (!task.dueAt) return false;
    const now = new Date();
    return new Date(task.dueAt) < now && task.status !== 'done';
  };

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getSortIcon = (field: SortField): string => {
    if (sortConfig.field !== field) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const allSelected = filteredAndSortedTasks.length > 0 && selectedTasks.size === filteredAndSortedTasks.length;
  const someSelected = selectedTasks.size > 0 && selectedTasks.size < filteredAndSortedTasks.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                options={STATUS_OPTIONS}
                value={filters.status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  setFilters(prev => ({ ...prev, status: e.target.value as any }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <Select
                options={PRIORITY_OPTIONS}
                value={filters.priority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  setFilters(prev => ({ ...prev, priority: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <Select
                options={DUE_DATE_OPTIONS}
                value={filters.dueDateRange}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  setFilters(prev => ({ ...prev, dueDateRange: e.target.value as any }))
                }
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => setFilters({
                  status: 'all',
                  priority: 'all',
                  assigneeId: 'all',
                  search: '',
                  dueDateRange: 'all'
                })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                {onBulkStatusChange && (
                  <>
                    <Button size="sm" onClick={() => handleBulkAction('status', 'todo')}>
                      Mark Todo
                    </Button>
                    <Button size="sm" onClick={() => handleBulkAction('status', 'doing')}>
                      Mark In Progress
                    </Button>
                    <Button size="sm" onClick={() => handleBulkAction('status', 'done')}>
                      Mark Done
                    </Button>
                  </>
                )}
                {onDeleteTasks && (
                  <Button variant="danger" size="sm" onClick={() => handleBulkAction('delete')}>
                    Delete Selected
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Tasks ({filteredAndSortedTasks.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No tasks match your current filters</p>
              <Button onClick={() => setFilters({
                status: 'all',
                priority: 'all',
                assigneeId: 'all',
                search: '',
                dueDateRange: 'all'
              })}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Title</span>
                        <span>{getSortIcon('title')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        <span>{getSortIcon('status')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('priority')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Priority</span>
                        <span>{getSortIcon('priority')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('dueAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Due Date</span>
                        <span>{getSortIcon('dueAt')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('assigneeId')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Assignee</span>
                        <span>{getSortIcon('assigneeId')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedTasks.map((task) => (
                    <tr 
                      key={task.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        isOverdue(task) ? 'bg-red-50' : ''
                      } ${selectedTasks.has(task.id) ? 'bg-blue-50' : ''}`}
                      onClick={() => onTaskClick?.(task)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTasks.has(task.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectTask(task.id, e.target.checked);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{task.title}</span>
                            {isOverdue(task) && (
                              <Badge variant="danger" size="xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={STATUS_VARIANTS[task.status]}>
                          {task.status === 'todo' ? 'To Do' : 
                           task.status === 'doing' ? 'In Progress' : 
                           task.status === 'blocked' ? 'Blocked' : 'Done'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.priority && (
                          <Badge variant={PRIORITY_VARIANTS[task.priority]}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(task.dueAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.assigneeId ? (
                          <Badge variant="neutral" size="sm">
                            Assigned
                          </Badge>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {onStatusChange && task.status !== 'done' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(task.id, 'done');
                              }}
                            >
                              Complete
                            </Button>
                          )}
                          {onStatusChange && task.status === 'done' && (
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredAndSortedTasks.length}
            </div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredAndSortedTasks.filter(t => t.status === 'done').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredAndSortedTasks.filter(t => t.status === 'doing').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-red-600">
              {filteredAndSortedTasks.filter(t => isOverdue(t)).length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}