import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
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

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chapterId, question_en, question_np, answer_en, answer_np, type } = body;

    if (!chapterId || !question_en || !question_np || !answer_en || !answer_np) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        chapterId,
        question_en,
        question_np,
        answer_en,
        answer_np,
        type: type || 'past'
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

    revalidatePath('/admin/subjects');
    return NextResponse.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, question_en, question_np, answer_en, answer_np, type } = body;

    if (!id || !question_en || !question_np || !answer_en || !answer_np) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        question_en,
        question_np,
        answer_en,
        answer_np,
        type: type || 'past'
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

    revalidatePath('/admin/subjects');
    return NextResponse.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}
