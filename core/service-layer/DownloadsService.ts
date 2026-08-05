import { eventBus } from '../event-bus';

export interface DownloadItem {
  id: string;
  filename: string;
  sizeMb: number;
  progressPct: number; // 100 for completed
  speedMbps?: number;
  timestamp: number;
  status: 'downloading' | 'completed' | 'paused' | 'failed';
}

export class DownloadsService {
  private downloads: DownloadItem[] = [
    {
      id: 'd1',
      filename: 'VSCodeSetup-x64-1.92.0.exe',
      sizeMb: 94.2,
      progressPct: 100,
      timestamp: Date.now() - 1800000,
      status: 'completed',
    },
    {
      id: 'd2',
      filename: 'windows11_sdk_22621.iso',
      sizeMb: 1024,
      progressPct: 64,
      speedMbps: 14.2,
      timestamp: Date.now() - 300000,
      status: 'downloading',
    },
  ];

  public getDownloads(): DownloadItem[] {
    return this.downloads;
  }

  public openDownloadLocation(id: string) {
    const item = this.downloads.find((d) => d.id === id);
    if (item) {
      if ((window as any).electronAPI?.openPath) {
        (window as any).electronAPI.openPath(item.filename);
      } else {
        eventBus.emit('NOTIFICATION_RECEIVED', {
          id: Date.now().toString(),
          type: 'info',
          title: 'Opening Downloads',
          message: `Opening folder for ${item.filename}`,
          timestamp: Date.now(),
          read: false,
        });
      }
    }
  }
}

export const downloadsService = new DownloadsService();
