import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

let driveClient: ReturnType<typeof google.drive> | null = null;

function getDriveClient() {
  if (!driveClient) {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    driveClient = google.drive({ version: 'v3', auth });
  }
  return driveClient;
}

export async function uploadToDrive(
  filePath: string,
  folderId?: string
): Promise<string> {
  const drive = getDriveClient();
  const fileName = path.basename(filePath);

  const fileMetadata: any = {
    name: fileName,
  };

  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  const media = {
    mimeType: 'video/mp4',
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id',
  });

  return response.data.id!;
}

export async function getDriveFileUrl(fileId: string): Promise<string> {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

