import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exportRecord = await prisma.export.findUnique({
      where: { id: params.id },
    });

    if (!exportRecord || exportRecord.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: exportRecord.status,
      outputUrl: exportRecord.outputUrl,
      driveFileId: exportRecord.driveFileId,
      completedAt: exportRecord.completedAt,
    });
  } catch (error) {
    console.error('Error fetching export status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

