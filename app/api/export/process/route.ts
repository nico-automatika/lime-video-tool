import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { addVideoJob, canUserProcess } from '@/lib/queue/videoQueue';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, clips, options, priority = 0 } = await request.json();

    // Verificar si el usuario puede procesar más videos
    if (!(await canUserProcess(session.user.id))) {
      return NextResponse.json(
        { error: 'Too many active jobs. Please wait for current jobs to complete.' },
        { status: 429 }
      );
    }

    // Crear registro de exportación
    const exportRecord = await prisma.export.create({
      data: {
        projectId,
        userId: session.user.id,
        status: 'PENDING',
        format: options.format || 'mp4',
        removeAudio: options.removeAudio || false,
        customAudioUrl: options.customAudioUrl,
        priority,
      },
    });

    // Agregar a la cola
    await addVideoJob(
      {
        exportId: exportRecord.id,
        userId: session.user.id,
        clips,
        options,
      },
      priority
    );

    return NextResponse.json({ exportId: exportRecord.id, status: 'PENDING' });
  } catch (error) {
    console.error('Error processing export:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

