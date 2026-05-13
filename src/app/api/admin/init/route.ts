import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Check if LLB faculty already exists
    let llbFaculty = await prisma.faculty.findUnique({
      where: { slug: 'llb' }
    });

    // Create if doesn't exist
    if (!llbFaculty) {
      llbFaculty = await prisma.faculty.create({
        data: {
          name: 'LLB',
          slug: 'llb'
        }
      });
    }

    // Update all years without faculty to reference LLB
    await prisma.year.updateMany({
      where: { facultyId: null },
      data: { facultyId: llbFaculty.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Database initialized with LLB faculty'
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}
