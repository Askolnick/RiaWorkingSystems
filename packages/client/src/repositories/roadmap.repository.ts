import { BaseRepository, MockRepository } from './base.repository';
import type { 
  RoadmapItem, 
  RoadmapComment, 
  CreateRoadmapItemData, 
  UpdateRoadmapItemData,
  CreateRoadmapCommentData,
  RoadmapItemWithComments,
  RoadmapStatus 
} from '@ria/roadmap-server';

export class RoadmapRepository extends BaseRepository<RoadmapItem, CreateRoadmapItemData, UpdateRoadmapItemData> {
  protected endpoint = '/roadmap';

  async getBySlug(slug: string): Promise<RoadmapItemWithComments> {
    return this.request('GET', `/${slug}`);
  }

  async getPublicItems(): Promise<RoadmapItem[]> {
    const response = await this.findAll({ filters: { public: true }, sortBy: 'createdAt', sortOrder: 'desc' });
    return response.data;
  }

  async getItemsByStatus(status: RoadmapStatus): Promise<RoadmapItem[]> {
    const response = await this.findAll({ filters: { status }, sortBy: 'createdAt', sortOrder: 'desc' });
    return response.data;
  }

  async createComment(data: CreateRoadmapCommentData): Promise<RoadmapComment> {
    return this.request('POST', '/comments', data);
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.request('DELETE', `/comments/${commentId}`);
  }

  async getComments(roadmapItemId: string): Promise<RoadmapComment[]> {
    return this.request('GET', `/${roadmapItemId}/comments`);
  }
}

export class MockRoadmapRepository extends MockRepository<RoadmapItem, CreateRoadmapItemData, UpdateRoadmapItemData> {
  protected storageKey = 'ria_roadmap_items';
  protected endpoint = '/roadmap';
  
  private commentsStorageKey = 'ria_roadmap_comments';

  private mockItems: RoadmapItem[] = [
    {
      id: '1',
      tenantId: 'demo-tenant',
      slug: 'advanced-reporting',
      title: 'Advanced Reporting Dashboard',
      description: 'Enhanced analytics and reporting capabilities with customizable charts and export options.',
      status: 'in-progress',
      public: true,
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-02-01').toISOString(),
    },
    {
      id: '2', 
      tenantId: 'demo-tenant',
      slug: 'mobile-app',
      title: 'Mobile Application',
      description: 'Native mobile app for iOS and Android with offline capabilities.',
      status: 'open',
      public: true,
      createdAt: new Date('2024-02-01').toISOString(),
      updatedAt: new Date('2024-02-01').toISOString(),
    },
    {
      id: '3',
      tenantId: 'demo-tenant',
      slug: 'api-v2',
      title: 'API v2.0',
      description: 'Complete API overhaul with GraphQL support and improved performance.',
      status: 'completed',
      public: true,
      createdAt: new Date('2023-10-15').toISOString(),
      updatedAt: new Date('2023-12-20').toISOString(),
    }
  ];

  private mockComments: RoadmapComment[] = [
    {
      id: 'c1',
      tenantId: 'demo-tenant',
      roadmapItemId: '1',
      body: 'Looking forward to the new dashboard! When will the chart customization be available?',
      createdAt: new Date('2024-02-05').toISOString(),
      updatedAt: new Date('2024-02-05').toISOString(),
    },
    {
      id: 'c2',
      tenantId: 'demo-tenant', 
      roadmapItemId: '1',
      body: 'We are targeting Q2 for the chart customization feature. Stay tuned!',
      createdAt: new Date('2024-02-06').toISOString(),
      updatedAt: new Date('2024-02-06').toISOString(),
    },
    {
      id: 'c3',
      tenantId: 'demo-tenant',
      roadmapItemId: '2',
      body: 'Will the mobile app support biometric authentication?',
      createdAt: new Date('2024-02-10').toISOString(),
      updatedAt: new Date('2024-02-10').toISOString(),
    }
  ];

  constructor() {
    super();
    // Initialize with mock data (only on client side)
    if (typeof window !== 'undefined') {
      if (this.getStorage().length === 0) {
        this.setStorage(this.mockItems);
      }
      if (this.getCommentsStorage().length === 0) {
        this.setCommentsStorage(this.mockComments);
      }
    }
  }

  private getCommentsStorage(): RoadmapComment[] {
    if (typeof window === 'undefined') {
      return []; // Return empty array on server side
    }
    const stored = localStorage.getItem(this.commentsStorageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private setCommentsStorage(comments: RoadmapComment[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.commentsStorageKey, JSON.stringify(comments));
    }
  }

  async getBySlug(slug: string): Promise<RoadmapItemWithComments> {
    await this.simulateDelay();
    
    const items = this.getStorage();
    const item = items.find(i => i.slug === slug);
    
    if (!item) {
      throw new Error('Roadmap item not found');
    }

    const comments = this.getCommentsStorage().filter(c => c.roadmapItemId === item.id);
    
    return {
      ...item,
      comments
    };
  }

  async getPublicItems(): Promise<RoadmapItem[]> {
    await this.simulateDelay();
    
    const items = this.getStorage();
    return items
      .filter(item => item.public)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getItemsByStatus(status: RoadmapStatus): Promise<RoadmapItem[]> {
    await this.simulateDelay();
    
    const items = this.getStorage();
    return items
      .filter(item => item.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createComment(data: CreateRoadmapCommentData): Promise<RoadmapComment> {
    await this.simulateDelay();
    
    const comments = this.getCommentsStorage();
    const newComment: RoadmapComment = {
      id: `c_${Date.now()}`,
      tenantId: 'demo-tenant',
      roadmapItemId: data.roadmapItemId,
      body: data.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    comments.push(newComment);
    this.setCommentsStorage(comments);
    
    return newComment;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.simulateDelay();
    
    const comments = this.getCommentsStorage();
    const filteredComments = comments.filter(c => c.id !== commentId);
    this.setCommentsStorage(filteredComments);
  }

  async getComments(roadmapItemId: string): Promise<RoadmapComment[]> {
    await this.simulateDelay();
    
    const comments = this.getCommentsStorage();
    return comments
      .filter(c => c.roadmapItemId === roadmapItemId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 150));
  }
}

export const roadmapRepository = new MockRoadmapRepository();
