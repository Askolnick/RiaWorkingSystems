"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button, Avatar, LoadingSpinner } from '@ria/web-ui';
import { auth } from '@ria/client';
import { usePortalStore } from '@ria/client';
import { ROUTES } from '@ria/utils';

export default function PortalHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const { 
    stats, 
    modules, 
    activities,
    statsLoading, 
    fetchStats,
    fetchActivities
  } = usePortalStore();

  useEffect(() => {
    auth.getSession().then((session) => {
      if (!session) {
        router.push(ROUTES.SIGN_IN);
      } else {
        setUser(session.user);
        // Fetch dashboard data once user is authenticated
        fetchStats();
        fetchActivities();
      }
    });
  }, [router, fetchStats, fetchActivities]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push(ROUTES.HOME);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Ria Management Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar size="sm" name={user.name || user.email} />
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{user.name || user.email}</p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name || user.email}</h2>
          <p className="text-gray-600">Choose a module to get started with your work today.</p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules
            .filter(module => module.isEnabled)
            .map((module) => (
            <Link key={module.name} href={module.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{module.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.name}</h3>
                    <p className="text-gray-600 text-sm">{module.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Quick Stats</h3>
          {statsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.activeClients}</div>
                  <div className="text-sm text-blue-800">Active Clients</div>
                </div>
              </Card>
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.pendingTasks}</div>
                  <div className="text-sm text-green-800">Pending Tasks</div>
                </div>
              </Card>
              <Card className="p-6 bg-purple-50 border-purple-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.aumThisMonth}</div>
                  <div className="text-sm text-purple-800">AUM This Month</div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        {activities.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Recent Activities</h3>
            <Card className="divide-y">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">
                        {activity.type === 'task' && '✅'}
                        {activity.type === 'client' && '👥'}
                        {activity.type === 'finance' && '💰'}
                        {activity.type === 'document' && '📄'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}