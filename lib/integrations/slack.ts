import { WebClient } from '@slack/web-api';

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

interface NotificationData {
  exportId: string;
  driveFileId: string;
  format: string;
}

export async function sendSlackNotification(data: NotificationData): Promise<void> {
  try {
    const driveUrl = `https://drive.google.com/file/d/${data.driveFileId}/view`;
    
    await slackClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID!,
      text: `Video export completed!`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Video Export Completed*\n\nFormat: ${data.format}\nExport ID: ${data.exportId}\n\n<${driveUrl}|Download from Google Drive>`,
          },
        },
      ],
    });
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    // No lanzar error para no fallar el procesamiento
  }
}

// Función alternativa usando webhook
export async function sendSlackWebhook(data: NotificationData): Promise<void> {
  if (!process.env.SLACK_WEBHOOK_URL) {
    return;
  }

  try {
    const driveUrl = `https://drive.google.com/file/d/${data.driveFileId}/view`;
    
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Video export completed!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Video Export Completed*\n\nFormat: ${data.format}\nExport ID: ${data.exportId}\n\n<${driveUrl}|Download from Google Drive>`,
            },
          },
        ],
      }),
    });
  } catch (error) {
    console.error('Error sending Slack webhook:', error);
  }
}

