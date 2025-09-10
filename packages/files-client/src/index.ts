// Mock Files API for demonstration
export interface FileAsset {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: string;
  tags?: string[];
  createdAt?: Date;
  modifiedAt?: Date;
}

class MockFilesAPI {
  private mockFiles: FileAsset[] = [
    { 
      id: '1', 
      name: 'Company Policy.pdf', 
      type: 'pdf', 
      url: '/files/company-policy.pdf',
      size: '2.4 MB',
      tags: ['policy', 'hr']
    },
    { 
      id: '2', 
      name: 'Training Video.mp4', 
      type: 'video', 
      url: '/files/training-video.mp4',
      size: '125 MB',
      tags: ['training', 'onboarding']
    },
    { 
      id: '3', 
      name: 'Budget Template.xlsx', 
      type: 'spreadsheet', 
      url: '/files/budget-template.xlsx',
      size: '450 KB',
      tags: ['finance', 'template']
    },
    { 
      id: '4', 
      name: 'Logo.png', 
      type: 'image', 
      url: '/files/logo.png',
      size: '85 KB',
      tags: ['branding', 'marketing']
    },
    { 
      id: '5', 
      name: 'Customer List.csv', 
      type: 'csv', 
      url: '/files/customer-list.csv',
      size: '1.2 MB',
      tags: ['customers', 'data']
    },
    { 
      id: '6', 
      name: 'Presentation.pptx', 
      type: 'presentation', 
      url: '/files/presentation.pptx',
      size: '5.8 MB',
      tags: ['sales', 'presentation']
    },
    { 
      id: '7', 
      name: 'Contract Template.docx', 
      type: 'document', 
      url: '/files/contract-template.docx',
      size: '125 KB',
      tags: ['legal', 'template']
    },
    { 
      id: '8', 
      name: 'Product Brochure.pdf', 
      type: 'pdf', 
      url: '/files/product-brochure.pdf',
      size: '3.2 MB',
      tags: ['marketing', 'sales']
    }
  ];

  async list(): Promise<FileAsset[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.mockFiles];
  }

  async get(id: string): Promise<FileAsset | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.mockFiles.find(f => f.id === id) || null;
  }

  async upload(file: File): Promise<FileAsset> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newFile: FileAsset = {
      id: Math.random().toString(36).slice(2),
      name: file.name,
      type: file.type,
      url: `/files/${file.name}`,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      tags: [],
      createdAt: new Date(),
      modifiedAt: new Date()
    };
    this.mockFiles.push(newFile);
    return newFile;
  }

  async delete(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = this.mockFiles.findIndex(f => f.id === id);
    if (index !== -1) {
      this.mockFiles.splice(index, 1);
      return true;
    }
    return false;
  }

  async search(query: string): Promise<FileAsset[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const lowercaseQuery = query.toLowerCase();
    return this.mockFiles.filter(f => 
      f.name.toLowerCase().includes(lowercaseQuery) ||
      f.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

export function createMockFiles() {
  return new MockFilesAPI();
}

// Export a default instance
export const filesAPI = createMockFiles();