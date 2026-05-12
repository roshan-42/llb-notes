import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const count = await prisma.subject.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting subjects:', error);
    return NextResponse.json({ count: 0, error: 'Failed to fetch' }, { status: 500 });
  }
}
