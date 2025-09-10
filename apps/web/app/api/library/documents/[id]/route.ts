import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@ria/db';
import { z } from 'zod';

const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  summary: z.string().optional(),
  bodyMd: z.string().optional(),
  kind: z.enum(['wiki', 'spec', 'policy', 'howto', 'memo', 'brief']).optional(),
  status: z.enum(['draft', 'review', 'published']).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await prisma.libraryDoc.findUnique({
      where: { id: params.id },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = updateDocumentSchema.parse(body);

    const document = await prisma.libraryDoc.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.libraryDoc.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}