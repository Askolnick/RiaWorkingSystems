"use client";
import { useEffect } from 'react';
import { useAdminStore } from '@ria/client';
import { Card, Button, LoadingSpinner, ErrorAlert } from '@ria/web-ui';

export default function AdminCenter() {
  const { 
    users, 
    roles,
    systemStats,
    usersLoading, 
    usersError,
    fetchUsers, 
    fetchRoles, 
    fetchSystemStats 
  } = useAdminStore();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchSystemStats();
  }, [fetchUsers, fetchRoles, fetchSystemStats]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Admin Center</h1>
      
      <p className="text-gray-700 dark:text-gray-300 mb-8">
        Administrative control panel for managing users, roles, permissions, and system settings.
      </p>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{systemStats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{systemStats.activeUsers}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{systemStats.totalStorage}</div>
            <div className="text-sm text-gray-600">Storage Used</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{systemStats.systemUptime}</div>
            <div className="text-sm text-gray-600">System Uptime</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Section */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">User Management</h2>
            <Button size="sm">Add User</Button>
          </div>
          
          {usersError && (
            <ErrorAlert className="mb-4">{usersError}</ErrorAlert>
          )}
          
          {usersLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-2">
              {users.slice(0, 5).map(user => (
                <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email} • {user.role}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Roles Section */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Role Management</h2>
            <Button size="sm">Add Role</Button>
          </div>
          
          <div className="space-y-2">
            {roles.map(role => (
              <div key={role.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{role.name}</div>
                  <div className="text-sm text-gray-500">{role.description}</div>
                </div>
                <span className="text-sm text-gray-600">{role.userCount} users</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}