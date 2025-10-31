import { Clip, Export, Project, SourceType, ExportStatus } from '@prisma/client';

export interface ClipData {
  id?: string;
  sourceUrl: string;
  sourceType: SourceType;
  startTime: number;
  endTime: number;
  order: number;
  title?: string;
}

export interface ExportOptions {
  format: string;
  quality?: string;
  removeAudio: boolean;
  customAudioUrl?: string;
  driveFolderId?: string;
  notifySlack?: boolean;
}

export interface VideoMetadata {
  title: string;
  duration: number;
  thumbnail?: string;
  width?: number;
  height?: number;
}

export interface ProcessingJob {
  exportId: string;
  userId: string;
  clips: Clip[];
  options: ExportOptions;
}

export interface ActiveSession {
  userId: string;
  projectId: string;
  startedAt: Date;
  lastActivity: Date;
}

export { SourceType, ExportStatus };
export type { Clip, Export, Project };

