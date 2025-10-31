import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { startTime, endTime, order, title } = body;

    const clip = await prisma.clip.findUnique({
      where: { id: params.id },
      include: { project: true },
    });

    if (!clip || clip.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.clip.update({
      where: { id: params.id },
      data: { startTime, endTime, order, title },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating clip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clip = await prisma.clip.findUnique({
      where: { id: params.id },
      include: { project: true },
    });

    if (!clip || clip.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.clip.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting clip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

