import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const years = await prisma.year.findMany({
      include: {
        subjects: {
          include: {
            chapters: true
          }
        }
      },
      orderBy: { year: 'asc' }
    });

    return NextResponse.json(years);
  } catch (error) {
    console.error('Error fetching years:', error);
    return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { facultyId, year, name } = body;

    if (!facultyId || !year) {
      return NextResponse.json(
        { error: 'Faculty ID and year number required' },
        { status: 400 }
      );
    }

    const newYear = await prisma.year.create({
      data: {
        facultyId,
        year,
        name: name || `Year ${year}`
      },
      include: {
        subjects: {
          include: {
            chapters: true
          }
        }
      }
    });

    revalidatePath('/admin');
    return NextResponse.json(newYear);
  } catch (error) {
    console.error('Error creating year:', error);
    return NextResponse.json({ error: 'Failed to create year' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, year, name } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Year ID required' },
        { status: 400 }
      );
    }

    const updated = await prisma.year.update({
      where: { id },
      data: {
        ...(year && { year }),
        ...(name && { name })
      },
      include: {
        subjects: {
          include: {
            chapters: true
          }
        }
      }
    });

    revalidatePath('/admin');
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating year:', error);
    return NextResponse.json({ error: 'Failed to update year' }, { status: 500 });
  }
}
