import { eventBus } from '../event-bus';

export interface ClipboardItem {
  id: string;
  text: string;
  timestamp: number;
  pinned: boolean;
}

export class ClipboardService {
  private history: ClipboardItem[] = [
    { id: '1', text: 'npx create-vite-app@latest desktop-action-hub', timestamp: Date.now() - 3600000, pinned: true },
    { id: '2', text: 'https://github.com/microsoft/winui3', timestamp: Date.now() - 7200000, pinned: false },
    { id: '3', text: 'Color Palette: #0078d4, #1e293b, #f8fafc', timestamp: Date.now() - 10800000, pinned: false },
  ];

  public getHistory(): ClipboardItem[] {
    return this.history;
  }

  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      this.addClip(text);
      eventBus.emit('NOTIFICATION_RECEIVED', {
        id: Date.now().toString(),
        type: 'success',
        title: 'Copied to Clipboard',
        message: text.length > 30 ? text.substring(0, 30) + '...' : text,
        timestamp: Date.now(),
        read: false,
      });
      return true;
    } catch (e) {
      console.error('[ClipboardService] Failed to copy:', e);
      return false;
    }
  }

  public addClip(text: string) {
    if (!text || this.history.some((item) => item.text === text)) return;
    const newItem: ClipboardItem = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
      pinned: false,
    };
    this.history = [newItem, ...this.history].slice(0, 20); // Keep last 20
    eventBus.emit('CLIPBOARD_HISTORY_UPDATED', this.history);
  }

  public togglePin(id: string) {
    this.history = this.history.map((item) =>
      item.id === id ? { ...item, pinned: !item.pinned } : item
    );
    eventBus.emit('CLIPBOARD_HISTORY_UPDATED', this.history);
  }

  public clearHistory() {
    this.history = this.history.filter((item) => item.pinned);
    eventBus.emit('CLIPBOARD_HISTORY_UPDATED', this.history);
  }
}

export const clipboardService = new ClipboardService();
