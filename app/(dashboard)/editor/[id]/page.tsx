import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import VideoEditor from '@/components/video/VideoEditor';

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      clips: { orderBy: { order: 'asc' } },
    },
  });

  if (!project || project.userId !== session.user.id) {
    redirect('/projects');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{project.name}</h1>
      <VideoEditor projectId={project.id} clips={project.clips} />
    </div>
  );
}

