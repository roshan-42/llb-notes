import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      include: {
        chapter: {
          include: {
            subject: {
              include: {
                year: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chapterId, title_en, title_np, content_en, content_np, order } = body;

    if (!chapterId || !title_en || !title_np || !content_en || !content_np || order === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        chapterId,
        title_en,
        title_np,
        content_en,
        content_np,
        order
      },
      include: {
        chapter: {
          include: {
            subject: {
              include: {
                year: true
              }
            }
          }
        }
      }
    });

    revalidatePath('/admin/notes');
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
