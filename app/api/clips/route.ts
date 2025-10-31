import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, sourceUrl, sourceType, startTime, endTime, order, title } = body;

    // Verificar que el proyecto pertenece al usuario
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const clip = await prisma.clip.create({
      data: {
        projectId,
        sourceUrl,
        sourceType,
        startTime,
        endTime,
        order,
        title,
      },
    });

    return NextResponse.json(clip);
  } catch (error) {
    console.error('Error creating clip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

