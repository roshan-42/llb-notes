import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

type Params = Promise<{ id: string }>;

export async function DELETE(
  request: Request,
  props: { params: Params }
) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);

    if (!id) {
      return NextResponse.json(
        { error: 'Year ID required' },
        { status: 400 }
      );
    }

    await prisma.year.delete({
      where: { id }
    });

    revalidatePath('/admin');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting year:', error);
    return NextResponse.json({ error: 'Failed to delete year' }, { status: 500 });
  }
}
