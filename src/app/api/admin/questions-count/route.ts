import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const count = await prisma.question.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting questions:', error);
    return NextResponse.json({ count: 0, error: 'Failed to fetch' }, { status: 500 });
  }
}
