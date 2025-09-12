import { BaseRepository, MockRepository } from './base.repository';
import type { WidgetInstance, DashboardLayout } from '@ria/portal-server';

interface CreateLayoutDTO {
  name: string;
  userId?: string;
  widgets: WidgetInstance[];
}

interface UpdateLayoutDTO {
  name?: string;
  widgets?: WidgetInstance[];
}

export class PortalRepository extends BaseRepository<DashboardLayout, CreateLayoutDTO, UpdateLayoutDTO> {
  protected endpoint = '/portal/layouts';

  async getLayout(name: string = 'default', userId?: string): Promise<DashboardLayout | null> {
    try {
      const filters: Record<string, string> = { name };
      if (userId) filters.userId = userId;
      
      const response = await this.findAll({ filters, limit: 1 });
      return response.data[0] || null;
    } catch (error) {
      return null;
    }
  }

  async saveLayout(layout: Omit<DashboardLayout, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<DashboardLayout> {
    const existing = await this.getLayout(layout.name, layout.userId);
    
    if (existing) {
      return this.update(existing.id, {
        widgets: layout.widgets
      });
    } else {
      return this.create({
        name: layout.name,
        userId: layout.userId,
        widgets: layout.widgets
      });
    }
  }
}

export class MockPortalRepository extends MockRepository<DashboardLayout, CreateLayoutDTO, UpdateLayoutDTO> {
  protected storageKey = 'ria_portal_layouts';
  protected endpoint = '/portal/layouts';

  private mockLayouts: DashboardLayout[] = [
    {
      id: '1',
      name: 'default',
      tenantId: 'demo-tenant',
      userId: null,
      widgets: [
        {
          id: '1',
          x: 0,
          y: 0,
          w: 2,
          h: 2,
          query: {
            entity: 'tasks',
            fields: ['title', 'status'],
            filters: [],
            viz: 'tile',
            limit: 5
          }
        },
        {
          id: '2',
          x: 2,
          y: 0,
          w: 2,
          h: 2,
          query: {
            entity: 'messages',
            fields: ['channel', 'from', 'status'],
            filters: [],
            viz: 'list',
            limit: 3
          }
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor() {
    super();
    // Initialize with mock data (only on client side)
    if (typeof window !== 'undefined') {
      const existingData = this.getStorage();
      if (existingData.length === 0) {
        this.setStorage(this.mockLayouts);
      }
    }
  }

  async getLayout(name: string = 'default', userId?: string): Promise<DashboardLayout | null> {
    await this.simulateDelay();
    
    const layouts = this.getStorage();
    const layout = layouts.find(l => 
      l.name === name && 
      (userId ? l.userId === userId : l.userId === null)
    );
    
    return layout || null;
  }

  async saveLayout(layout: Omit<DashboardLayout, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<DashboardLayout> {
    await this.simulateDelay();
    
    const layouts = this.getStorage();
    const existingIndex = layouts.findIndex(l => 
      l.name === layout.name && 
      (layout.userId ? l.userId === layout.userId : l.userId === null)
    );

    if (existingIndex >= 0) {
      // Update existing
      layouts[existingIndex] = {
        ...layouts[existingIndex],
        widgets: layout.widgets,
        updatedAt: new Date()
      };
      this.setStorage(layouts);
      return layouts[existingIndex];
    } else {
      // Create new
      const newLayout: DashboardLayout = {
        id: Date.now().toString(),
        name: layout.name,
        tenantId: 'demo-tenant',
        userId: layout.userId || null,
        widgets: layout.widgets,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      layouts.push(newLayout);
      this.setStorage(layouts);
      return newLayout;
    }
  }

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Lazy initialization to prevent bundle bloat
let _portalRepository: MockPortalRepository | null = null;

export const portalRepository = {
  get instance(): MockPortalRepository {
    if (!_portalRepository) {
      _portalRepository = new MockPortalRepository();
    }
    return _portalRepository;
  }
};

export const dashboardLayoutRepository = portalRepository; // Alias for backward compatibility