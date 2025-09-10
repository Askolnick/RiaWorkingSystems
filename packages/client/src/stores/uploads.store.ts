import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { fileRepository, folderRepository } from '../repositories/uploads.repository';
import type { 
  UploadedFile,
  Folder,
  CreateFileDTO,
  UpdateFileDTO,
  CreateFolderDTO,
  UpdateFolderDTO,
  FileSearchParams,
  UploadProgress
} from '../types/uploads.types';

interface UploadsStore {
  // Files
  files: UploadedFile[];
  currentFile: UploadedFile | null;
  filesLoading: boolean;
  filesError: string | null;
  
  // Folders
  folders: Folder[];
  currentFolder: Folder | null;
  foldersLoading: boolean;
  foldersError: string | null;
  
  // Upload progress
  uploadProgress: UploadProgress[];
  
  // Filters and search
  searchParams: FileSearchParams;
  selectedFiles: string[];
  
  // File actions
  fetchFiles: (params?: FileSearchParams) => Promise<void>;
  fetchFile: (id: string) => Promise<void>;
  uploadFile: (fileData: CreateFileDTO, onProgress?: (progress: number) => void) => Promise<UploadedFile>;
  updateFile: (id: string, updates: UpdateFileDTO) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  deleteFiles: (ids: string[]) => Promise<void>;
  moveFile: (id: string, folderId: string) => Promise<void>;
  moveFiles: (ids: string[], folderId: string) => Promise<void>;
  
  // Folder actions
  fetchFolders: () => Promise<void>;
  fetchFolder: (id: string) => Promise<void>;
  createFolder: (data: CreateFolderDTO) => Promise<Folder>;
  updateFolder: (id: string, updates: UpdateFolderDTO) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  getRootFolders: () => Promise<void>;
  getFolderChildren: (parentId: string) => Promise<Folder[]>;
  
  // Search and filter actions
  setSearchParams: (params: Partial<FileSearchParams>) => void;
  clearSearchParams: () => void;
  
  // Selection actions
  selectFile: (id: string) => void;
  selectFiles: (ids: string[]) => void;
  unselectFile: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Upload progress actions
  addUploadProgress: (progress: UploadProgress) => void;
  updateUploadProgress: (fileId: string, progress: Partial<UploadProgress>) => void;
  removeUploadProgress: (fileId: string) => void;
  clearUploadProgress: () => void;
}

export const useUploadsStore = create<UploadsStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      files: [],
      currentFile: null,
      filesLoading: false,
      filesError: null,
      
      folders: [],
      currentFolder: null,
      foldersLoading: false,
      foldersError: null,
      
      uploadProgress: [],
      
      searchParams: {},
      selectedFiles: [],
      
      // File actions
      fetchFiles: async (params?: FileSearchParams) => {
        set(state => {
          state.filesLoading = true;
          state.filesError = null;
          if (params) {
            state.searchParams = { ...state.searchParams, ...params };
          }
        });
        
        try {
          const response = await fileRepository.findAll(params || get().searchParams);
          set(state => {
            state.files = response.data;
            state.filesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.filesError = error instanceof Error ? error.message : 'Failed to fetch files';
            state.filesLoading = false;
          });
        }
      },
      
      fetchFile: async (id: string) => {
        set(state => {
          state.filesLoading = true;
          state.filesError = null;
        });
        
        try {
          const file = await fileRepository.findById(id);
          set(state => {
            state.currentFile = file;
            state.filesLoading = false;
          });
        } catch (error) {
          set(state => {
            state.filesError = error instanceof Error ? error.message : 'Failed to fetch file';
            state.filesLoading = false;
          });
        }
      },
      
      uploadFile: async (fileData: CreateFileDTO, onProgress?: (progress: number) => void) => {
        const uploadId = Date.now().toString();
        
        // Add upload progress tracking
        set(state => {
          state.uploadProgress.push({
            fileId: uploadId,
            fileName: fileData.name,
            progress: 0,
            status: 'uploading'
          });
        });
        
        try {
          // Simulate upload progress
          if (onProgress) {
            const intervals = [10, 30, 50, 75, 90, 100];
            for (const progress of intervals) {
              await new Promise(resolve => setTimeout(resolve, 200));
              onProgress(progress);
              set(state => {
                const upload = state.uploadProgress.find(u => u.fileId === uploadId);
                if (upload) {
                  upload.progress = progress;
                }
              });
            }
          }
          
          const newFile = await fileRepository.uploadFile(fileData);
          
          set(state => {
            state.files.unshift(newFile);
            // Mark upload as complete
            const upload = state.uploadProgress.find(u => u.fileId === uploadId);
            if (upload) {
              upload.status = 'complete';
              upload.progress = 100;
            }
          });
          
          // Remove upload progress after delay
          setTimeout(() => {
            set(state => {
              state.uploadProgress = state.uploadProgress.filter(u => u.fileId !== uploadId);
            });
          }, 2000);
          
          return newFile;
        } catch (error) {
          set(state => {
            const upload = state.uploadProgress.find(u => u.fileId === uploadId);
            if (upload) {
              upload.status = 'error';
              upload.error = error instanceof Error ? error.message : 'Upload failed';
            }
          });
          throw error;
        }
      },
      
      updateFile: async (id: string, updates: UpdateFileDTO) => {
        try {
          const updatedFile = await fileRepository.update(id, updates);
          set(state => {
            const index = state.files.findIndex(f => f.id === id);
            if (index !== -1) {
              state.files[index] = updatedFile;
            }
            if (state.currentFile?.id === id) {
              state.currentFile = updatedFile;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      deleteFile: async (id: string) => {
        try {
          await fileRepository.deleteFile(id);
          set(state => {
            state.files = state.files.filter(f => f.id !== id);
            state.selectedFiles = state.selectedFiles.filter(fid => fid !== id);
            if (state.currentFile?.id === id) {
              state.currentFile = null;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      deleteFiles: async (ids: string[]) => {
        try {
          await Promise.all(ids.map(id => fileRepository.deleteFile(id)));
          set(state => {
            state.files = state.files.filter(f => !ids.includes(f.id));
            state.selectedFiles = state.selectedFiles.filter(id => !ids.includes(id));
            if (state.currentFile && ids.includes(state.currentFile.id)) {
              state.currentFile = null;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      moveFile: async (id: string, folderId: string) => {
        try {
          await fileRepository.moveFile(id, folderId);
          // Refresh files to reflect the move
          await get().fetchFiles();
        } catch (error) {
          throw error;
        }
      },
      
      moveFiles: async (ids: string[], folderId: string) => {
        try {
          await Promise.all(ids.map(id => fileRepository.moveFile(id, folderId)));
          // Refresh files to reflect the moves
          await get().fetchFiles();
        } catch (error) {
          throw error;
        }
      },
      
      // Folder actions
      fetchFolders: async () => {
        set(state => {
          state.foldersLoading = true;
          state.foldersError = null;
        });
        
        try {
          const response = await folderRepository.findAll();
          set(state => {
            state.folders = response.data;
            state.foldersLoading = false;
          });
        } catch (error) {
          set(state => {
            state.foldersError = error instanceof Error ? error.message : 'Failed to fetch folders';
            state.foldersLoading = false;
          });
        }
      },
      
      fetchFolder: async (id: string) => {
        try {
          const folder = await folderRepository.findById(id);
          set(state => {
            state.currentFolder = folder;
          });
        } catch (error) {
          set(state => {
            state.foldersError = error instanceof Error ? error.message : 'Failed to fetch folder';
          });
        }
      },
      
      createFolder: async (data: CreateFolderDTO) => {
        try {
          const newFolder = await folderRepository.createFolder(data);
          set(state => {
            state.folders.push(newFolder);
          });
          return newFolder;
        } catch (error) {
          throw error;
        }
      },
      
      updateFolder: async (id: string, updates: UpdateFolderDTO) => {
        try {
          const updatedFolder = await folderRepository.update(id, updates);
          set(state => {
            const index = state.folders.findIndex(f => f.id === id);
            if (index !== -1) {
              state.folders[index] = updatedFolder;
            }
            if (state.currentFolder?.id === id) {
              state.currentFolder = updatedFolder;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      deleteFolder: async (id: string) => {
        try {
          await folderRepository.deleteFolder(id);
          set(state => {
            state.folders = state.folders.filter(f => f.id !== id);
            if (state.currentFolder?.id === id) {
              state.currentFolder = null;
            }
          });
        } catch (error) {
          throw error;
        }
      },
      
      getRootFolders: async () => {
        try {
          const folders = await folderRepository.getRootFolders();
          set(state => {
            state.folders = folders;
          });
        } catch (error) {
          console.error('Failed to get root folders:', error);
        }
      },
      
      getFolderChildren: async (parentId: string) => {
        try {
          return await folderRepository.getFolderChildren(parentId);
        } catch (error) {
          console.error('Failed to get folder children:', error);
          return [];
        }
      },
      
      // Search and filter actions
      setSearchParams: (params: Partial<FileSearchParams>) => {
        set(state => {
          state.searchParams = { ...state.searchParams, ...params };
        });
        // Automatically refetch with new params
        get().fetchFiles();
      },
      
      clearSearchParams: () => {
        set(state => {
          state.searchParams = {};
        });
        get().fetchFiles();
      },
      
      // Selection actions
      selectFile: (id: string) => {
        set(state => {
          if (!state.selectedFiles.includes(id)) {
            state.selectedFiles.push(id);
          }
        });
      },
      
      selectFiles: (ids: string[]) => {
        set(state => {
          state.selectedFiles = [...new Set([...state.selectedFiles, ...ids])];
        });
      },
      
      unselectFile: (id: string) => {
        set(state => {
          state.selectedFiles = state.selectedFiles.filter(fid => fid !== id);
        });
      },
      
      clearSelection: () => {
        set(state => {
          state.selectedFiles = [];
        });
      },
      
      selectAll: () => {
        set(state => {
          state.selectedFiles = state.files.map(f => f.id);
        });
      },
      
      // Upload progress actions
      addUploadProgress: (progress: UploadProgress) => {
        set(state => {
          state.uploadProgress.push(progress);
        });
      },
      
      updateUploadProgress: (fileId: string, progress: Partial<UploadProgress>) => {
        set(state => {
          const upload = state.uploadProgress.find(u => u.fileId === fileId);
          if (upload) {
            Object.assign(upload, progress);
          }
        });
      },
      
      removeUploadProgress: (fileId: string) => {
        set(state => {
          state.uploadProgress = state.uploadProgress.filter(u => u.fileId !== fileId);
        });
      },
      
      clearUploadProgress: () => {
        set(state => {
          state.uploadProgress = [];
        });
      },
    }))
  )
);