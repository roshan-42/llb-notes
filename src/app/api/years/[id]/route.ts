import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const yearNum = parseInt(id);

    if (isNaN(yearNum) || yearNum < 1 || yearNum > 3) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    const yearData = await prisma.year.findFirst({
      where: {
        year: yearNum,
        faculty: { slug: 'llb' }
      },
      select: {
        subjects: {
          select: {
            id: true,
            name_en: true,
            name_np: true,
            slug: true,
            icon: true
          },
          orderBy: { slug: 'asc' }
        }
      }
    });

    if (!yearData) {
      return NextResponse.json({ error: 'Year not found' }, { status: 404 });
    }

    return NextResponse.json(yearData);
  } catch (error) {
    console.error('Error fetching year data:', error);
    return NextResponse.json({ error: 'Failed to fetch year data' }, { status: 500 });
  }
}
