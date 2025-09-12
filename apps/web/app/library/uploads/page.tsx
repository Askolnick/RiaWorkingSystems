"use client";
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUploadsStore } from '@ria/client';
import { Button, Input, LoadingSpinner, ErrorAlert } from '@ria/web-ui';

const LibraryTabs = dynamic(() => import('../_components/LibraryTabs'), {
  loading: () => <div className="border-b mb-3 h-12 animate-pulse bg-gray-100 rounded" />
});

const FolderSidebar = dynamic(() => import('./_components/FolderSidebar'), {
  loading: () => <div className="w-64 bg-white border-r animate-pulse h-96" />
});

const FileGrid = dynamic(() => import('./_components/FileGrid'), {
  loading: () => <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="bg-gray-100 aspect-square rounded animate-pulse" />
    ))}
  </div>
});

export default function UploadsPage() {
  const { 
    files, 
    folders,
    filesLoading, 
    filesError,
    foldersLoading,
    searchParams,
    selectedFiles,
    uploadProgress,
    fetchFiles, 
    fetchFolders,
    setSearchParams,
    clearSearchParams,
    createFolder,
    uploadFile,
    clearSelection
  } = useUploadsStore();

  useEffect(() => {
    fetchFiles();
    fetchFolders();
  }, [fetchFiles, fetchFolders]);

  const handleSearch = (value: string) => {
    setSearchParams({ search: value });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        await uploadFile({
          name: file.name,
          file: file,
          tags: []
        });
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
    
    // Clear the input
    event.target.value = '';
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (name) {
      try {
        await createFolder({ name });
      } catch (error) {
        console.error('Failed to create folder:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Library - Uploads</h1>
      <LibraryTabs />
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">File Storage</h2>
          <div className="flex gap-2">
            <Button onClick={handleCreateFolder}>
              📁 New Folder
            </Button>
            <Button>
              <label className="cursor-pointer">
                ⬆️ Upload Files
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileUpload}
                />
              </label>
            </Button>
          </div>
        </div>
        
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search files..."
              value={searchParams.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={clearSearchParams}>
            Clear Search
          </Button>
          {selectedFiles.length > 0 && (
            <Button variant="outline" onClick={clearSelection}>
              Clear Selection ({selectedFiles.length})
            </Button>
          )}
        </div>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Uploading...</h3>
            <div className="space-y-2">
              {uploadProgress.map((progress) => (
                <div key={progress.fileId} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{progress.fileName}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ '--progress': `${progress.progress}%` } as React.CSSProperties & { '--progress': string }}
                      data-progress-bar
                    />
                  </div>
                  <span className="text-xs text-gray-500">{progress.progress}%</span>
                  {progress.status === 'error' && (
                    <span className="text-xs text-red-500">Error</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {filesError && (
          <ErrorAlert 
            className="mb-6"
          >
            {filesError}
          </ErrorAlert>
        )}
        
        {filesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="w-64 flex-shrink-0">
              <FolderSidebar />
            </div>
            <div className="flex-1">
              <FileGrid files={files} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}