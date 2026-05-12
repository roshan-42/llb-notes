'use server';

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';

// Notes
export async function createNote(data: {
  chapterId: number;
  title_en: string;
  title_np: string;
  content_en: string;
  content_np: string;
  order: number;
}) {
  try {
    const note = await prisma.note.create({
      data
    });
    revalidatePath('/admin/notes');
    return { success: true, note };
  } catch (error) {
    console.error('Error creating note:', error);
    return { success: false, error: 'Failed to create note' };
  }
}

export async function updateNote(
  id: number,
  data: {
    title_en: string;
    title_np: string;
    content_en: string;
    content_np: string;
  }
) {
  try {
    const note = await prisma.note.update({
      where: { id },
      data
    });
    revalidatePath('/admin/notes');
    return { success: true, note };
  } catch (error) {
    console.error('Error updating note:', error);
    return { success: false, error: 'Failed to update note' };
  }
}

export async function deleteNote(id: number) {
  try {
    await prisma.note.delete({
      where: { id }
    });
    revalidatePath('/admin/notes');
    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { success: false, error: 'Failed to delete note' };
  }
}

// Questions
export async function createQuestion(data: {
  chapterId: number;
  question_en: string;
  question_np: string;
  answer_en: string;
  answer_np: string;
  type: 'past' | 'possible';
}) {
  try {
    const question = await prisma.question.create({
      data
    });
    revalidatePath('/admin/questions');
    return { success: true, question };
  } catch (error) {
    console.error('Error creating question:', error);
    return { success: false, error: 'Failed to create question' };
  }
}

export async function updateQuestion(
  id: number,
  data: {
    question_en: string;
    question_np: string;
    answer_en: string;
    answer_np: string;
    type: 'past' | 'possible';
  }
) {
  try {
    const question = await prisma.question.update({
      where: { id },
      data
    });
    revalidatePath('/admin/questions');
    return { success: true, question };
  } catch (error) {
    console.error('Error updating question:', error);
    return { success: false, error: 'Failed to update question' };
  }
}

export async function deleteQuestion(id: number) {
  try {
    await prisma.question.delete({
      where: { id }
    });
    revalidatePath('/admin/questions');
    return { success: true };
  } catch (error) {
    console.error('Error deleting question:', error);
    return { success: false, error: 'Failed to delete question' };
  }
}

// Subjects
export async function createSubject(data: {
  yearId: number;
  name_en: string;
  name_np: string;
  slug: string;
  icon?: string;
}) {
  try {
    const subject = await prisma.subject.create({
      data
    });
    revalidatePath('/admin/subjects');
    return { success: true, subject };
  } catch (error) {
    console.error('Error creating subject:', error);
    return { success: false, error: 'Failed to create subject' };
  }
}

export async function updateSubject(
  id: number,
  data: {
    name_en: string;
    name_np: string;
    icon?: string;
  }
) {
  try {
    const subject = await prisma.subject.update({
      where: { id },
      data
    });
    revalidatePath('/admin/subjects');
    return { success: true, subject };
  } catch (error) {
    console.error('Error updating subject:', error);
    return { success: false, error: 'Failed to update subject' };
  }
}

// Chapters
export async function createChapter(data: {
  subjectId: number;
  title_en: string;
  title_np: string;
  order: number;
}) {
  try {
    const chapter = await prisma.chapter.create({
      data
    });
    revalidatePath('/admin/subjects');
    return { success: true, chapter };
  } catch (error) {
    console.error('Error creating chapter:', error);
    return { success: false, error: 'Failed to create chapter' };
  }
}

export async function updateChapter(
  id: number,
  data: {
    title_en: string;
    title_np: string;
  }
) {
  try {
    const chapter = await prisma.chapter.update({
      where: { id },
      data
    });
    revalidatePath('/admin/subjects');
    return { success: true, chapter };
  } catch (error) {
    console.error('Error updating chapter:', error);
    return { success: false, error: 'Failed to update chapter' };
  }
}
