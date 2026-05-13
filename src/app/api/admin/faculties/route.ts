import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        years: {
          include: {
            subjects: {
              include: {
                chapters: {
                  include: {
                    notes: true,
                    questions: true
                  }
                }
              }
            }
          },
          orderBy: { year: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(faculties);
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return NextResponse.json({ error: 'Failed to fetch faculties' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Faculty name is required' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const faculty = await prisma.faculty.create({
      data: { name, slug },
      include: {
        years: {
          include: {
            subjects: true
          }
        }
      }
    });

    revalidatePath('/admin');
    return NextResponse.json(faculty);
  } catch (error) {
    console.error('Error creating faculty:', error);
    return NextResponse.json({ error: 'Failed to create faculty' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const faculty = await prisma.faculty.update({
      where: { id },
      data: { name, slug },
      include: {
        years: {
          include: {
            subjects: true
          }
        }
      }
    });

    revalidatePath('/admin');
    return NextResponse.json(faculty);
  } catch (error) {
    console.error('Error updating faculty:', error);
    return NextResponse.json({ error: 'Failed to update faculty' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Faculty ID is required' },
        { status: 400 }
      );
    }

    await prisma.faculty.delete({
      where: { id: parseInt(id) }
    });

    revalidatePath('/admin');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    return NextResponse.json({ error: 'Failed to delete faculty' }, { status: 500 });
  }
}
