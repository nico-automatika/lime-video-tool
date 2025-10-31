import ffmpeg from 'fluent-ffmpeg';
import { Clip } from '@/types';
import { ExportOptions } from '@/types';
import path from 'path';
import fs from 'fs';

interface ProcessVideoResult {
  outputPath: string;
  url?: string;
}

export async function processVideo(
  clips: Clip[],
  options: ExportOptions & { maxMemory?: string; threads?: number }
): Promise<ProcessVideoResult> {
  const outputDir = path.join(process.cwd(), 'temp');
  const outputFile = path.join(outputDir, `export-${Date.now()}.${options.format || 'mp4'}`);

  // Asegurar que el directorio existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    // Agregar cada clip
    clips.forEach((clip) => {
      command.input(clip.sourceUrl);
      
      // Aplicar filtro de tiempo para cada input
      const inputIndex = clips.indexOf(clip);
      command
        .inputOptions([`-ss ${clip.startTime}`, `-t ${clip.endTime - clip.startTime}`]);
    });

    // Configurar salida
    command
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-pix_fmt yuv420p',
        '-preset medium',
        '-crf 23',
        `-threads ${options.threads || 2}`,
      ]);

    // Manejar audio
    if (options.removeAudio) {
      command.audioFilters('anull');
    } else if (options.customAudioUrl) {
      command.input(options.customAudioUrl);
      command.complexFilter([
        {
          filter: 'amix',
          options: { inputs: clips.length + 1, duration: 'longest' },
        },
      ]);
    }

    // Concatenar clips
    if (clips.length > 1) {
      // Crear archivo de lista para concatenación
      const concatFile = path.join(outputDir, `concat-${Date.now()}.txt`);
      const concatList = clips
        .map((_, index) => `file '${clips[index].sourceUrl}'`)
        .join('\n');
      
      fs.writeFileSync(concatFile, concatList);
      command.input(concatFile);
    }

    command
      .output(outputFile)
      .on('end', () => {
        resolve({
          outputPath: outputFile,
          url: `/api/files/${path.basename(outputFile)}`,
        });
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}

export async function downloadYouTubeVideo(url: string): Promise<string> {
  // Esta función debería usar ytdl-core para descargar el video
  // Por ahora retornamos la URL directa
  return url;
}

export async function downloadDriveVideo(fileId: string): Promise<string> {
  // Implementar descarga de Google Drive
  // Por ahora retornamos un placeholder
  return `drive://${fileId}`;
}

