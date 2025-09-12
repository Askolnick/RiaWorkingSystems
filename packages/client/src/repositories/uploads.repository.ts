import { BaseRepository } from './base.repository';
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

/**
 * Mock folder data generator
 */
const generateMockFolders = (): Folder[] => {
  return [
    {
      id: '1',
      name: 'Documents',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      fileCount: 15,
      totalSize: '45.2 MB'
    },
    {
      id: '2',
      name: 'Images',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-12T00:00:00Z',
      fileCount: 8,
      totalSize: '23.1 MB'
    },
    {
      id: '3',
      name: 'Templates',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
      fileCount: 5,
      totalSize: '12.4 MB'
    },
    {
      id: '4',
      name: 'Design Assets',
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-08T00:00:00Z',
      fileCount: 12,
      totalSize: '67.8 MB'
    },
    {
      id: '5',
      name: 'Videos',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z',
      fileCount: 3,
      totalSize: '234.5 MB'
    },
    {
      id: '6',
      name: 'Archives',
      parentId: '1',
      createdAt: '2024-01-06T00:00:00Z',
      updatedAt: '2024-01-06T00:00:00Z',
      fileCount: 7,
      totalSize: '89.3 MB'
    }
  ];
};

/**
 * Mock file data generator
 */
const generateMockFiles = (): UploadedFile[] => {
  return [
    {
      id: '1',
      name: 'Annual Report 2024.pdf',
      size: '2.4 MB',
      type: 'pdf',
      modified: '2024-01-15',
      folder: 'Documents',
      url: '/files/annual-report-2024.pdf',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      uploadedBy: 'John Doe',
      tags: ['report', 'annual', '2024']
    },
    {
      id: '2',
      name: 'Team Photo.jpg',
      size: '1.8 MB',
      type: 'image',
      modified: '2024-01-10',
      folder: 'Images',
      url: '/files/team-photo.jpg',
      thumbnail: '/files/thumbs/team-photo.jpg',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
      uploadedBy: 'Jane Smith',
      tags: ['team', 'photo', 'group']
    },
    {
      id: '3',
      name: 'Budget Spreadsheet.xlsx',
      size: '856 KB',
      type: 'spreadsheet',
      modified: '2024-01-08',
      folder: 'Documents',
      url: '/files/budget-spreadsheet.xlsx',
      createdAt: '2024-01-08T00:00:00Z',
      updatedAt: '2024-01-08T00:00:00Z',
      uploadedBy: 'Bob Johnson',
      tags: ['budget', 'finance', 'spreadsheet']
    },
    {
      id: '4',
      name: 'Presentation Template.pptx',
      size: '3.2 MB',
      type: 'presentation',
      modified: '2024-01-05',
      folder: 'Templates',
      url: '/files/presentation-template.pptx',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z',
      uploadedBy: 'Alice Brown',
      tags: ['template', 'presentation', 'powerpoint']
    },
    {
      id: '5',
      name: 'Logo Design.ai',
      size: '4.1 MB',
      type: 'design',
      modified: '2024-01-03',
      folder: 'Design Assets',
      url: '/files/logo-design.ai',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      uploadedBy: 'Charlie Davis',
      tags: ['logo', 'design', 'brand']
    },
    {
      id: '6',
      name: 'Meeting Recording.mp4',
      size: '89.2 MB',
      type: 'video',
      modified: '2024-01-01',
      folder: 'Videos',
      url: '/files/meeting-recording.mp4',
      thumbnail: '/files/thumbs/meeting-recording.jpg',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      uploadedBy: 'David Wilson',
      tags: ['meeting', 'recording', 'video']
    },
    {
      id: '7',
      name: 'Company Handbook.pdf',
      size: '5.7 MB',
      type: 'pdf',
      modified: '2024-01-12',
      folder: 'Documents',
      url: '/files/company-handbook.pdf',
      createdAt: '2024-01-12T00:00:00Z',
      updatedAt: '2024-01-12T00:00:00Z',
      uploadedBy: 'Emily Johnson',
      tags: ['handbook', 'company', 'policies']
    },
    {
      id: '8',
      name: 'Product Photos.zip',
      size: '25.3 MB',
      type: 'other',
      modified: '2024-01-09',
      folder: 'Images',
      url: '/files/product-photos.zip',
      createdAt: '2024-01-09T00:00:00Z',
      updatedAt: '2024-01-09T00:00:00Z',
      uploadedBy: 'Frank Miller',
      tags: ['product', 'photos', 'archive']
    }
  ];
};

/**
 * Repository for file operations
 */
export class FileRepository extends BaseRepository<UploadedFile, CreateFileDTO, UpdateFileDTO> {
  protected endpoint = '/api/uploads/files';
  private mockData: UploadedFile[] = generateMockFiles();

  async findAll(params?: FileSearchParams) {
    let filteredData = [...this.mockData];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredData = filteredData.filter(file =>
        file.name.toLowerCase().includes(search) ||
        file.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    if (params?.type) {
      filteredData = filteredData.filter(file => file.type === params.type);
    }

    if (params?.folderId) {
      const folders = generateMockFolders();
      const folder = folders.find(f => f.id === params.folderId);
      if (folder) {
        filteredData = filteredData.filter(file => file.folder === folder.name);
      }
    }

    if (params?.tags && params.tags.length > 0) {
      filteredData = filteredData.filter(file =>
        params.tags!.some(tag => file.tags?.includes(tag))
      );
    }

    return {
      data: filteredData,
      total: filteredData.length,
      page: 1,
      limit: Math.min(10, filteredData.length),
      hasMore: false,
    };
  }

  async findById(id: string): Promise<UploadedFile> {
    const file = this.mockData.find(f => f.id === id);
    if (!file) throw new Error('File not found');
    return file;
  }

  async uploadFile(fileData: CreateFileDTO): Promise<UploadedFile> {
    // Simulate file upload
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: fileData.name,
      size: this.formatFileSize(fileData.file.size),
      type: this.getFileType(fileData.file.type),
      modified: new Date().toISOString().split('T')[0],
      folder: fileData.folderId ? 'Custom Folder' : 'Root',
      url: `/files/${fileData.file.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      tags: fileData.tags || []
    };

    this.mockData.unshift(newFile);
    return newFile;
  }

  async deleteFile(id: string): Promise<void> {
    this.mockData = this.mockData.filter(f => f.id !== id);
  }

  async moveFile(id: string, folderId: string): Promise<void> {
    const file = this.mockData.find(f => f.id === id);
    const folders = generateMockFolders();
    const folder = folders.find(f => f.id === folderId);
    
    if (file && folder) {
      file.folder = folder.name;
      file.updatedAt = new Date().toISOString();
    }
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private getFileType(mimeType: string): UploadedFile['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
    return 'other';
  }
}

/**
 * Repository for folder operations
 */
export class FolderRepository extends BaseRepository<Folder, CreateFolderDTO, UpdateFolderDTO> {
  protected endpoint = '/api/uploads/folders';
  private mockData: Folder[] = generateMockFolders();

  async findAll() {
    return {
      data: this.mockData,
      total: this.mockData.length,
      page: 1,
      limit: Math.min(10, this.mockData.length),
      hasMore: false,
    };
  }

  async findById(id: string): Promise<Folder> {
    const folder = this.mockData.find(f => f.id === id);
    if (!folder) throw new Error('Folder not found');
    return folder;
  }

  async createFolder(data: CreateFolderDTO): Promise<Folder> {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: data.name,
      parentId: data.parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileCount: 0,
      totalSize: '0 B'
    };

    this.mockData.push(newFolder);
    return newFolder;
  }

  async deleteFolder(id: string): Promise<void> {
    // In production, check if folder is empty first
    this.mockData = this.mockData.filter(f => f.id !== id);
  }

  async getRootFolders(): Promise<Folder[]> {
    return this.mockData.filter(f => !f.parentId);
  }

  async getFolderChildren(parentId: string): Promise<Folder[]> {
    return this.mockData.filter(f => f.parentId === parentId);
  }
}

// Lazy initialization to prevent bundle bloat
let _fileRepository: FileRepository | null = null;
let _folderRepository: FolderRepository | null = null;

export const fileRepository = {
  get instance(): FileRepository {
    if (!_fileRepository) {
      _fileRepository = new FileRepository();
    }
    return _fileRepository;
  }
};

export const folderRepository = {
  get instance(): FolderRepository {
    if (!_folderRepository) {
      _folderRepository = new FolderRepository();
    }
    return _folderRepository;
  }
};