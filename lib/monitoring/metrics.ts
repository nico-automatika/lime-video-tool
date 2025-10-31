import { Registry, Counter, Gauge, Histogram } from 'prom-client';

const register = new Registry();

export const metrics = {
  activeUsers: new Gauge({
    name: 'video_editor_active_users',
    help: 'Number of active users editing',
    registers: [register],
  }),

  processingJobs: new Gauge({
    name: 'video_processing_jobs',
    help: 'Number of jobs being processed',
    labelNames: ['status'],
    registers: [register],
  }),

  processingDuration: new Histogram({
    name: 'video_processing_duration_seconds',
    help: 'Duration of video processing',
    buckets: [10, 30, 60, 120, 300, 600],
    registers: [register],
  }),

  queueSize: new Gauge({
    name: 'video_queue_size',
    help: 'Size of processing queue',
    registers: [register],
  }),
};

export { register };

