import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        year: true,
        chapters: true
      },
      orderBy: [{ year: { year: 'asc' } }, { name_en: 'asc' }]
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { yearId, name_en, name_np, icon } = body;

    if (!yearId || !name_en || !name_np) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const slug = name_en
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const subject = await prisma.subject.create({
      data: {
        yearId,
        name_en,
        name_np,
        slug,
        icon: icon || null
      },
      include: {
        year: true,
        chapters: true
      }
    });

    revalidatePath('/admin/subjects');
    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name_en, name_np, icon } = body;

    if (!id || !name_en || !name_np) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name_en,
        name_np,
        icon: icon || null
      },
      include: {
        year: true,
        chapters: true
      }
    });

    revalidatePath('/admin/subjects');
    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing subject ID' },
        { status: 400 }
      );
    }

    await prisma.subject.delete({
      where: { id: parseInt(id) }
    });

    revalidatePath('/admin/subjects');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
