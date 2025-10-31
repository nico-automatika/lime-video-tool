import { NextResponse } from 'next/server';
import ytdl from 'ytdl-core';
import { google } from 'googleapis';
import { SourceType } from '@/types';

export async function POST(request: Request) {
  try {
    const { url, sourceType } = await request.json();

    if (sourceType === SourceType.YOUTUBE) {
      if (!ytdl.validateURL(url)) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
      }

      const info = await ytdl.getInfo(url);
      return NextResponse.json({
        title: info.videoDetails.title,
        duration: parseFloat(info.videoDetails.lengthSeconds),
        thumbnail: info.videoDetails.thumbnails[0]?.url,
      });
    } else if (sourceType === SourceType.GOOGLE_DRIVE) {
      const drive = google.drive({
        version: 'v3',
        auth: process.env.GOOGLE_DRIVE_API_KEY,
      });

      const fileId = extractDriveFileId(url);
      const file = await drive.files.get({
        fileId,
        fields: 'name,thumbnailLink,size',
      });

      return NextResponse.json({
        title: file.data.name || 'Untitled',
        thumbnail: file.data.thumbnailLink,
      });
    }

    return NextResponse.json({ error: 'Invalid source type' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}

function extractDriveFileId(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : '';
}

