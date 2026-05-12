import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const count = await prisma.chapter.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting chapters:', error);
    return NextResponse.json({ count: 0, error: 'Failed to fetch' }, { status: 500 });
  }
}
