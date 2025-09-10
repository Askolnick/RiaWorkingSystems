export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'spreadsheet' | 'presentation' | 'design' | 'video' | 'document' | 'other';
  modified: string;
  folder: string;
  url?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: string;
  tags?: string[];
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
  totalSize: string;
}

export interface CreateFileDTO {
  name: string;
  file: File;
  folderId?: string;
  tags?: string[];
}

export interface UpdateFileDTO {
  name?: string;
  folderId?: string;
  tags?: string[];
}

export interface CreateFolderDTO {
  name: string;
  parentId?: string;
}

export interface UpdateFolderDTO {
  name: string;
}

export interface FileSearchParams {
  search?: string;
  type?: UploadedFile['type'];
  folderId?: string;
  tags?: string[];
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}