import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (subjectId) {
      const chapters = await prisma.chapter.findMany({
        where: { subjectId: parseInt(subjectId) },
        include: { notes: true, questions: true },
        orderBy: { order: 'asc' }
      });
      return NextResponse.json(chapters);
    }

    const chapters = await prisma.chapter.findMany({
      include: { subject: true, notes: true, questions: true },
      orderBy: [{ subject: { year: { year: 'asc' } } }, { order: 'asc' }]
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subjectId, title_en, title_np, order } = body;

    if (!subjectId || !title_en || !title_np || order === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.create({
      data: {
        subjectId,
        title_en,
        title_np,
        order
      },
      include: { notes: true, questions: true }
    });

    revalidatePath('/admin/subjects');
    revalidatePath('/admin/notes');
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title_en, title_np, order } = body;

    if (!id || !title_en || !title_np || order === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.update({
      where: { id },
      data: {
        title_en,
        title_np,
        order
      },
      include: { notes: true, questions: true }
    });

    revalidatePath('/admin/subjects');
    revalidatePath('/admin/notes');
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing chapter ID' },
        { status: 400 }
      );
    }

    await prisma.chapter.delete({
      where: { id: parseInt(id) }
    });

    revalidatePath('/admin/subjects');
    revalidatePath('/admin/notes');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
