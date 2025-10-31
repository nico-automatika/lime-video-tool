import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sessionManager } from '@/lib/session/concurrent';
import { videoQueue } from '@/lib/queue/videoQueue';
import Redis from 'ioredis';

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    const redis = new Redis(process.env.REDIS_URL!);
    await redis.ping();
    redis.disconnect();
    return true;
  } catch {
    return false;
  }
}

async function checkStorage(): Promise<boolean> {
  // Basic check - can be enhanced
  return true;
}

async function checkWorkers(): Promise<boolean> {
  try {
    const workers = await videoQueue.getWorkers();
    return workers.length > 0;
  } catch {
    return false;
  }
}

export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    storage: await checkStorage(),
    workers: await checkWorkers(),
    activeUsers: sessionManager.getActiveCount(),
    queueSize: await videoQueue.getWaitingCount(),
  };

  const healthy = Object.values(checks).every((check) => 
    typeof check === 'boolean' ? check : check >= 0
  );

  return NextResponse.json({
    status: healthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
}

