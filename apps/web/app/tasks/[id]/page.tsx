'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasksStore, createEntityRef, useEntityLinks } from '@ria/client';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  Badge,
  LoadingCard,
  Alert,
  EntityLinkViewer,
  EntityLinkBadgeList,
  EntityLinkGraph,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@ria/web-ui';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('details');
  const [showGraph, setShowGraph] = useState(false);
  
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    updateTask,
    deleteTask,
  } = useTasksStore();

  // Find the specific task
  const task = tasks.find(t => t.id === taskId);
  
  // Create entity reference for this task
  const taskEntity = task ? createEntityRef('task', task.id, task.tenantId || 'default') : null;
  
  // Use EntityLinks hook
  const {
    links,
    linksByKind,
    loading: linksLoading,
    error: linksError,
    createLink,
    deleteLink,
    hasLinkTo,
    getLinkedEntities,
  } = useEntityLinks(taskEntity, {
    autoFetch: true,
    includeDetails: true,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (!tasks.length) {
      fetchTasks();
    }
  }, [tasks.length, fetchTasks]);

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(task.id);
      router.push('/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleLinkCreated = (link: any) => {
    console.log('Link created:', link);
    // Could show a toast notification here
  };

  const handleLinkDeleted = (linkId: string) => {
    console.log('Link deleted:', linkId);
    // Could show a toast notification here
  };

  const handleNodeClick = (entity: any) => {
    // Navigate to the linked entity
    if (entity.type === 'task') {
      router.push(`/tasks/${entity.id}`);
    } else if (entity.type === 'project') {
      router.push(`/projects/${entity.id}`);
    }
    // Add more entity type navigation as needed
  };

  if (loading && !task) {
    return <LoadingCard />;
  }

  if (error) {
    return (
      <Alert type="error">
        {error}
        <Button variant="outline" size="sm" onClick={() => fetchTasks()} className="ml-2">
          Retry
        </Button>
      </Alert>
    );
  }

  if (!task) {
    return (
      <Alert type="error">
        Task not found
        <Button variant="outline" size="sm" onClick={() => router.push('/tasks')} className="ml-2">
          Back to Tasks
        </Button>
      </Alert>
    );
  }

  // Get dependency information from links
  const blockedByLinks = linksByKind?.['blocks'] || [];
  const dependsOnLinks = linksByKind?.['depends_on'] || [];
  const parentLinks = linksByKind?.['child_of'] || [];
  const childLinks = linksByKind?.['parent_of'] || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-600 mt-2">{task.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={task.status === 'done' ? 'success' : 'primary'}>
              {task.status}
            </Badge>
            <Badge variant="secondary">
              {task.priority || 'medium'} priority
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Link Badges */}
      {links.length > 0 && (
        <div className="mb-4">
          <EntityLinkBadgeList
            links={links}
            currentEntity={taskEntity!}
            maxVisible={8}
            onLinkClick={(link) => console.log('Link clicked:', link)}
            onEntityClick={handleNodeClick}
            showDirection={true}
            size="sm"
          />
        </div>
      )}

      {/* Dependency Warnings */}
      {blockedByLinks.length > 0 && (
        <Alert type="warning" className="mb-4">
          This task is blocked by {blockedByLinks.length} other task(s)
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="relationships">
            Relationships 
            {links.length > 0 && (
              <Badge variant="secondary" size="sm" className="ml-2">
                {links.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="graph">Dependency Graph</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <p className="mt-1">{task.priority || 'Medium'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Assignee</label>
                  <p className="mt-1">{task.assigneeId || 'Unassigned'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Due Date</label>
                  <p className="mt-1">{task.dueDate || 'No due date'}</p>
                </div>
                
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-600">{task.description || 'No description'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => router.push('/tasks')}>
                  Back to Tasks
                </Button>
                <Button variant="outline" className="text-red-600" onClick={handleDelete}>
                  Delete Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships">
          <EntityLinkViewer
            entity={taskEntity!}
            readonly={false}
            showCreateButton={true}
            allowedLinkKinds={['depends_on', 'blocks', 'parent_of', 'child_of', 'references', 'assigned_to', 'relates']}
            onLinkCreated={handleLinkCreated}
            onLinkDeleted={handleLinkDeleted}
            onError={(error) => console.error('Link error:', error)}
          />
        </TabsContent>

        {/* Graph Tab */}
        <TabsContent value="graph">
          <Card>
            <CardHeader>
              <CardTitle>Dependency Graph</CardTitle>
              <p className="text-sm text-gray-600">
                Visual representation of task dependencies and relationships
              </p>
            </CardHeader>
            <CardContent>
              <EntityLinkGraph
                entity={taskEntity!}
                maxDepth={3}
                height={500}
                width={800}
                onNodeClick={handleNodeClick}
                allowedLinkKinds={['depends_on', 'blocks', 'parent_of', 'child_of']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Activity history will be shown here</p>
              {/* TODO: Implement activity history */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}