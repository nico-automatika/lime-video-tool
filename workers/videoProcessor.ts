import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '@/lib/db';
import { ProcessingJob } from '@/types';
import { processVideo } from '@/lib/video-processing/ffmpeg';
import { WORKER_CONCURRENCY } from '@/lib/queue/videoQueue';
import { uploadToDrive } from '@/lib/integrations/googleDrive';
import { sendSlackNotification } from '@/lib/integrations/slack';

const connection = new Redis(process.env.REDIS_URL!);

// Worker con límites de recursos
const videoWorker = new Worker(
  'video-processing',
  async (job: Job<ProcessingJob>) => {
    const { exportId, clips, options } = job.data;

    // Actualizar estado
    await prisma.export.update({
      where: { id: exportId },
      data: { status: 'PROCESSING' },
    });

    try {
      // Procesar video con límite de memoria
      const result = await processVideo(clips, {
        ...options,
        maxMemory: '2GB',
        threads: 2, // Limitar threads por job
      });

      // Subir a Google Drive si se especificó
      let driveFileId: string | undefined;
      if (options.driveFolderId) {
        driveFileId = await uploadToDrive(result.outputPath, options.driveFolderId);
      }

      // Actualizar resultado
      await prisma.export.update({
        where: { id: exportId },
        data: {
          status: 'COMPLETED',
          outputUrl: result.url || result.outputPath,
          driveFileId,
          completedAt: new Date(),
        },
      });

      // Enviar notificación de Slack
      if (options.notifySlack && driveFileId) {
        await sendSlackNotification({
          exportId,
          driveFileId,
          format: options.format,
        });
        
        await prisma.export.update({
          where: { id: exportId },
          data: { slackNotified: true },
        });
      }

      return result;
    } catch (error) {
      console.error('Error processing video:', error);
      
      await prisma.export.update({
        where: { id: exportId },
        data: { status: 'FAILED' },
      });
      
      throw error;
    }
  },
  {
    connection,
    concurrency: WORKER_CONCURRENCY,
    limiter: {
      max: 10,
      duration: 60000, // 10 jobs por minuto
    },
  }
);

videoWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('Video processing worker started');

