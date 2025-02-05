import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { JournalEntry } from '../types/journal';

export async function exportJournalToPDF(entry: JournalEntry): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <title>${entry.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          direction: rtl;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .content {
          font-size: 16px;
          line-height: 1.6;
        }
        .tags {
          margin-top: 20px;
          color: #666;
        }
        .date {
          color: #666;
          margin-top: 10px;
        }
        img {
          max-width: 100%;
          height: auto;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="title">${entry.title}</div>
      <div class="content">${entry.content}</div>
      <div class="tags">תגיות: ${entry.tags.join(', ')}</div>
      <div class="date">נוצר ב: ${new Date(entry.createdAt).toLocaleDateString('he-IL')}</div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}
