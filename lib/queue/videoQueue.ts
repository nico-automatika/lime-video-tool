import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { ProcessingJob } from '@/types';

const connection = new Redis(process.env.REDIS_URL!);

// Cola con prioridades para usuarios
export const videoQueue = new Queue('video-processing', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

// Límites de concurrencia
export const CONCURRENT_USERS = 10;
export const MAX_JOBS_PER_USER = parseInt(process.env.MAX_JOBS_PER_USER || '2');
export const WORKER_CONCURRENCY = parseInt(process.env.CONCURRENT_JOBS || '3');

// Rate limiting por usuario
export async function canUserProcess(userId: string): Promise<boolean> {
  const userJobs = await videoQueue.getJobs(['active', 'waiting']);
  const userActiveJobs = userJobs.filter((job) => (job.data as ProcessingJob).userId === userId);
  return userActiveJobs.length < MAX_JOBS_PER_USER;
}

export async function addVideoJob(job: ProcessingJob, priority: number = 0) {
  return await videoQueue.add('process-video', job, {
    priority,
    jobId: job.exportId,
  });
}

