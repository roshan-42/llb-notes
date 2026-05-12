import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
