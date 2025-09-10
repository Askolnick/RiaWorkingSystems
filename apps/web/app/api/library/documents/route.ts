import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@ria/db';
import { z } from 'zod';

// Validation schemas
const createDocumentSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  bodyMd: z.string().optional(),
  kind: z.enum(['wiki', 'spec', 'policy', 'howto', 'memo', 'brief']),
  status: z.enum(['draft', 'review', 'published']).default('draft'),
  tags: z.array(z.string()).optional(),
});

const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  kind: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    
    const { page, pageSize, search, kind, status } = queryParamsSchema.parse(params);
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { bodyMd: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (kind) where.kind = kind;
    if (status) where.status = status;

    // Get documents with pagination
    const [documents, total] = await Promise.all([
      prisma.libraryDoc.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          kind: true,
          status: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.libraryDoc.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      data: documents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createDocumentSchema.parse(body);

    // For now, use a default tenant and owner
    // In production, get these from authentication context
    const tenantId = 'default-tenant';
    const ownerId = 'default-user';

    const document = await prisma.libraryDoc.create({
      data: {
        ...data,
        tenantId,
        ownerId,
        tags: data.tags || [],
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}