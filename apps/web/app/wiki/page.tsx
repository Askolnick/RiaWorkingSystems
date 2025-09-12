'use client';

import { useEffect } from 'react';
import { useWikiStore } from '@ria/client';
import {
  Card,
  Button,
  LoadingCard,
  Alert,
  ErrorBoundary,
  Badge,
  SearchInput,
  CardGrid
} from '@ria/web-ui';
import { useRouter } from 'next/navigation';

export default function WikiPage() {
  const router = useRouter();
  const {
    spaces,
    loading,
    error,
    stats,
    fetchSpaces,
    fetchStats,
    clearError
  } = useWikiStore();

  useEffect(() => {
    fetchSpaces();
    fetchStats();
  }, [fetchSpaces, fetchStats]);

  const handleCreateSpace = () => {
    router.push('/wiki/spaces/new');
  };

  const handleSpaceClick = (spaceId: string) => {
    router.push(`/wiki/spaces/${spaceId}`);
  };

  if (loading.spaces) return <LoadingCard />;
  if (error) return <Alert type="error" onClose={clearError}>{error}</Alert>;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground mt-1">
              Organize and share knowledge across your organization
            </p>
          </div>
          <Button onClick={handleCreateSpace}>
            Create Space
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Spaces</p>
              <p className="text-2xl font-bold mt-1">{stats.totalSpaces}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Pages</p>
              <p className="text-2xl font-bold mt-1">{stats.totalPages}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="text-2xl font-bold mt-1">{stats.publishedPages}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold mt-1">{stats.draftPages}</p>
            </Card>
          </div>
        )}

        {/* Spaces Grid */}
        {spaces.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-sm mx-auto">
              <h3 className="text-lg font-semibold">No spaces yet</h3>
              <p className="text-muted-foreground mt-2">Create your first knowledge space to get started</p>
              <Button onClick={handleCreateSpace} className="mt-4">
                Create First Space
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <Card
                key={space.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSpaceClick(space.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {space.icon && (
                      <div className="text-2xl">{space.icon}</div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{space.name}</h3>
                      {space.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {space.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={space.isPublic ? 'default' : 'secondary'}>
                    {space.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Updated {new Date(space.updatedAt).toLocaleDateString()}
                  </span>
                  <span>
                    Click to explore
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Activity */}
        {stats?.recentlyUpdated && stats.recentlyUpdated.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recently Updated</h2>
            <div className="space-y-2">
              {stats.recentlyUpdated.slice(0, 5).map((page) => (
                <Card key={page.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{page.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Updated {new Date(page.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                      {page.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}