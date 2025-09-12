/**
 * Base Repository Pattern
 * Provides common CRUD operations and error handling for all repositories
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface QueryParams extends PaginationParams {
  search?: string;
  filters?: Record<string, string | number | boolean | string[]>;
}

export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export abstract class BaseRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  protected abstract endpoint: string;
  protected baseUrl: string;
  protected useMockData: boolean;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    // Check environment variable to determine if we should use mock data
    this.useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  }

  /**
   * Handle API errors consistently
   */
  protected handleError(error: any): never {
    if (error.response) {
      throw new RepositoryError(
        error.response.data?.message || 'API Error',
        error.response.data?.code || 'API_ERROR',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new RepositoryError(
        'Network error - no response received',
        'NETWORK_ERROR',
        0
      );
    } else {
      throw new RepositoryError(
        error.message || 'Unknown error',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Build query string from params
   */
  protected buildQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params.search) searchParams.set('search', params.search);
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Make HTTP request with error handling
   */
  protected async request<R = any>(
    method: string,
    path: string,
    data?: any,
    options?: RequestInit
  ): Promise<R> {
    try {
      const url = `${this.baseUrl}${this.endpoint}${path}`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      if (!response.ok) {
        throw {
          response: {
            data: await response.json().catch(() => ({})),
            status: response.status,
          },
        };
      }

      return response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all items with optional pagination and filters
   */
  async findAll(params?: QueryParams): Promise<PaginatedResponse<T>> {
    const queryString = this.buildQueryString(params || {});
    return this.request<PaginatedResponse<T>>('GET', queryString);
  }

  /**
   * Get single item by ID
   */
  async findById(id: string): Promise<T> {
    return this.request<T>('GET', `/${id}`);
  }

  /**
   * Create new item
   */
  async create(data: CreateDTO): Promise<T> {
    return this.request<T>('POST', '', data);
  }

  /**
   * Update existing item
   */
  async update(id: string, data: UpdateDTO): Promise<T> {
    return this.request<T>('PATCH', `/${id}`, data);
  }

  /**
   * Delete item
   */
  async delete(id: string): Promise<void> {
    return this.request<void>('DELETE', `/${id}`);
  }

  /**
   * Batch operations
   */
  async createMany(items: CreateDTO[]): Promise<T[]> {
    return this.request<T[]>('POST', '/batch', { items });
  }

  async updateMany(updates: Array<{ id: string; data: UpdateDTO }>): Promise<T[]> {
    return this.request<T[]>('PATCH', '/batch', { updates });
  }

  async deleteMany(ids: string[]): Promise<void> {
    return this.request<void>('DELETE', '/batch', { ids });
  }
}

/**
 * Mock Repository for development
 * Simulates API calls with localStorage
 */
export abstract class MockRepository<T extends { id: string }, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> 
  extends BaseRepository<T, CreateDTO, UpdateDTO> {
  
  protected abstract storageKey: string;
  private delay = 100; // Simulate network delay

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  protected getStorage(): T[] {
    if (typeof window === 'undefined') {
      return []; // Return empty array on server side
    }
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  protected setStorage(data: T[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
  }

  async findAll(params?: QueryParams): Promise<PaginatedResponse<T>> {
    await this.simulateDelay();
    
    let items = this.getStorage();
    
    // Apply search
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      items = items.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchLower)
      );
    }
    
    // Apply filters
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        items = items.filter(item => (item as any)[key] === value);
      });
    }
    
    // Apply sorting
    if (params?.sortBy) {
      items.sort((a, b) => {
        const aVal = (a as any)[params.sortBy!];
        const bVal = (b as any)[params.sortBy!];
        const order = params.sortOrder === 'desc' ? -1 : 1;
        return aVal > bVal ? order : -order;
      });
    }
    
    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);
    
    return {
      data: paginatedItems,
      total: items.length,
      page,
      limit,
      hasMore: start + limit < items.length,
    };
  }

  async findById(id: string): Promise<T> {
    await this.simulateDelay();
    const items = this.getStorage();
    const item = items.find(i => i.id === id);
    
    if (!item) {
      throw new RepositoryError('Item not found', 'NOT_FOUND', 404);
    }
    
    return item;
  }

  async create(data: CreateDTO): Promise<T> {
    await this.simulateDelay();
    const items = this.getStorage();
    
    const newItem = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as T;
    
    items.push(newItem);
    this.setStorage(items);
    
    return newItem;
  }

  async update(id: string, data: UpdateDTO): Promise<T> {
    await this.simulateDelay();
    const items = this.getStorage();
    const index = items.findIndex(i => i.id === id);
    
    if (index === -1) {
      throw new RepositoryError('Item not found', 'NOT_FOUND', 404);
    }
    
    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    } as T;
    
    this.setStorage(items);
    return items[index];
  }

  async delete(id: string): Promise<void> {
    await this.simulateDelay();
    const items = this.getStorage();
    const index = items.findIndex(i => i.id === id);
    
    if (index === -1) {
      throw new RepositoryError('Item not found', 'NOT_FOUND', 404);
    }
    
    items.splice(index, 1);
    this.setStorage(items);
  }
}