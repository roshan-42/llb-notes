import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const chapters = await prisma.chapter.findMany({
      where: {
        subject: {
          slug
        }
      },
      include: {
        notes: {
          orderBy: { order: 'asc' }
        },
        questions: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}
