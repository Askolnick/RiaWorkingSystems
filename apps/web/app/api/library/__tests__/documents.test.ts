import { GET, POST } from '../documents/route';
import { NextRequest } from 'next/server';

// Mock the Prisma client
jest.mock('@ria/db', () => ({
  prisma: {
    libraryDoc: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { prisma } from '@ria/db';

// Properly type the mocked Prisma client
const mockPrisma = prisma as {
  libraryDoc: {
    findMany: jest.MockedFunction<typeof prisma.libraryDoc.findMany>;
    count: jest.MockedFunction<typeof prisma.libraryDoc.count>;
    create: jest.MockedFunction<typeof prisma.libraryDoc.create>;
  };
};

describe('/api/library/documents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/library/documents', () => {
    it('returns paginated documents with default parameters', async () => {
      const mockDocuments = [
        {
          id: '1',
          title: 'Test Document 1',
          summary: 'Test summary 1',
          kind: 'wiki',
          status: 'published',
          tags: ['tag1'],
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: '2',
          title: 'Test Document 2',
          summary: 'Test summary 2',
          kind: 'spec',
          status: 'draft',
          tags: ['tag2'],
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
      ];

      mockPrisma.libraryDoc.findMany.mockResolvedValue(mockDocuments as any);
      mockPrisma.libraryDoc.count.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/library/documents');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockDocuments);
      expect(data.pagination).toEqual({
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      });

      expect(mockPrisma.libraryDoc.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          kind: true,
          status: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('handles pagination parameters correctly', async () => {
      const mockDocuments = [
        {
          id: '3',
          title: 'Test Document 3',
          summary: 'Test summary 3',
          kind: 'policy',
          status: 'published',
          tags: [],
          createdAt: new Date('2023-01-03'),
          updatedAt: new Date('2023-01-03'),
        },
      ];

      mockPrisma.libraryDoc.findMany.mockResolvedValue(mockDocuments as any);
      mockPrisma.libraryDoc.count.mockResolvedValue(25);

      const request = new NextRequest('http://localhost:3000/api/library/documents?page=2&pageSize=5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination).toEqual({
        page: 2,
        pageSize: 5,
        total: 25,
        totalPages: 5,
      });

      expect(mockPrisma.libraryDoc.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5,
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('handles search query correctly', async () => {
      mockPrisma.libraryDoc.findMany.mockResolvedValue([]);
      mockPrisma.libraryDoc.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/library/documents?search=test query');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.libraryDoc.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test query', mode: 'insensitive' } },
            { summary: { contains: 'test query', mode: 'insensitive' } },
            { bodyMd: { contains: 'test query', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('handles kind and status filters correctly', async () => {
      mockPrisma.libraryDoc.findMany.mockResolvedValue([]);
      mockPrisma.libraryDoc.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/library/documents?kind=wiki&status=published');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.libraryDoc.findMany).toHaveBeenCalledWith({
        where: {
          kind: 'wiki',
          status: 'published',
        },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('handles database errors gracefully', async () => {
      mockPrisma.libraryDoc.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/library/documents');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch documents' });
    });
  });

  describe('POST /api/library/documents', () => {
    it('creates a new document with valid data', async () => {
      const mockDocument = {
        id: 'new-doc-id',
        title: 'New Document',
        summary: 'New document summary',
        bodyMd: 'Document content',
        kind: 'wiki',
        status: 'draft',
        tags: ['new', 'test'],
        tenantId: 'default-tenant',
        authorId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.libraryDoc.create.mockResolvedValue(mockDocument as any);

      const requestBody = {
        title: 'New Document',
        summary: 'New document summary',
        bodyMd: 'Document content',
        kind: 'wiki',
        status: 'draft',
        tags: ['new', 'test'],
      };

      const request = new NextRequest('http://localhost:3000/api/library/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockDocument);

      expect(mockPrisma.libraryDoc.create).toHaveBeenCalledWith({
        data: {
          title: 'New Document',
          summary: 'New document summary',
          bodyMd: 'Document content',
          kind: 'wiki',
          status: 'draft',
          tags: ['new', 'test'],
          tenantId: 'default-tenant',
          authorId: 'default-user',
        },
      });
    });

    it('handles missing required fields', async () => {
      const requestBody = {
        summary: 'Missing title',
        kind: 'wiki',
      };

      const request = new NextRequest('http://localhost:3000/api/library/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
      expect(data.details).toBeDefined();
      expect(mockPrisma.libraryDoc.create).not.toHaveBeenCalled();
    });

    it('handles invalid enum values', async () => {
      const requestBody = {
        title: 'Test Document',
        kind: 'invalid-kind',
        status: 'invalid-status',
      };

      const request = new NextRequest('http://localhost:3000/api/library/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
      expect(mockPrisma.libraryDoc.create).not.toHaveBeenCalled();
    });

    it('applies default values correctly', async () => {
      const mockDocument = {
        id: 'new-doc-id',
        title: 'Minimal Document',
        kind: 'wiki',
        status: 'draft',
        tags: [],
        tenantId: 'default-tenant',
        authorId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.libraryDoc.create.mockResolvedValue(mockDocument as any);

      const requestBody = {
        title: 'Minimal Document',
        kind: 'wiki',
        // status should default to 'draft'
        // tags should default to empty array
      };

      const request = new NextRequest('http://localhost:3000/api/library/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockPrisma.libraryDoc.create).toHaveBeenCalledWith({
        data: {
          title: 'Minimal Document',
          kind: 'wiki',
          status: 'draft',
          tags: [],
          tenantId: 'default-tenant',
          authorId: 'default-user',
        },
      });
    });

    it('handles database errors gracefully', async () => {
      mockPrisma.libraryDoc.create.mockRejectedValue(new Error('Database error'));

      const requestBody = {
        title: 'Test Document',
        kind: 'wiki',
      };

      const request = new NextRequest('http://localhost:3000/api/library/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create document' });
    });

    it('handles malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/library/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create document');
      expect(mockPrisma.libraryDoc.create).not.toHaveBeenCalled();
    });
  });
});