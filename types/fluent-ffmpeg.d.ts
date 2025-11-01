declare module 'fluent-ffmpeg' {
  import { EventEmitter } from 'events';

  interface FfmpegCommand extends EventEmitter {
    input(input: string): FfmpegCommand;
    inputOptions(options: string[]): FfmpegCommand;
    videoCodec(codec: string): FfmpegCommand;
    audioCodec(codec: string): FfmpegCommand;
    outputOptions(options: string[]): FfmpegCommand;
    audioFilters(filters: string): FfmpegCommand;
    complexFilter(filters: any[]): FfmpegCommand;
    output(output: string): FfmpegCommand;
    on(event: 'end', callback: () => void): FfmpegCommand;
    on(event: 'error', callback: (err: Error) => void): FfmpegCommand;
    run(): FfmpegCommand;
  }

  function ffmpeg(input?: string): FfmpegCommand;
  export = ffmpeg;
}

