import { eventBus } from '../event-bus';

export interface Point {
  x: number;
  y: number;
}

export interface ScreenBounds {
  width: number;
  height: number;
}

export class WindowManager {
  private position: Point = { x: window.innerWidth - 90, y: window.innerHeight / 2 - 30 };
  private screenBounds: ScreenBounds = { width: window.innerWidth, height: window.innerHeight };
  private isAutoHidden: boolean = false;
  private autoHideTimer: number | null = null;

  constructor() {
    this.updateScreenBounds();
    window.addEventListener('resize', () => this.updateScreenBounds());
  }

  public updateScreenBounds() {
    this.screenBounds = {
      width: window.innerWidth || 1920,
      height: window.innerHeight || 1080,
    };
    eventBus.emit('SCREEN_BOUNDS_CHANGED', this.screenBounds);
  }

  public getPosition(): Point {
    return this.position;
  }

  public setPosition(pos: Point, snapToEdge: boolean = true) {
    let targetX = pos.x;
    let targetY = Math.max(20, Math.min(pos.y, this.screenBounds.height - 80));

    if (snapToEdge) {
      const snapMargin = 80;
      if (targetX < snapMargin) {
        targetX = 16; // Snap left
      } else if (targetX > this.screenBounds.width - snapMargin - 60) {
        targetX = this.screenBounds.width - 76; // Snap right
      }
    }

    this.position = { x: targetX, y: targetY };
    eventBus.emit('WINDOW_POSITION_CHANGED', this.position);

    // Notify Electron native window if running in Electron environment
    if ((window as any).electronAPI?.moveWindow) {
      (window as any).electronAPI.moveWindow(targetX, targetY);
    }
  }

  public startAutoHideTimer(delaySec: number = 5, callback: () => void) {
    this.clearAutoHideTimer();
    this.autoHideTimer = window.setTimeout(() => {
      this.isAutoHidden = true;
      eventBus.emit('WINDOW_AUTO_HIDE_TRIGGERED');
      callback();
    }, delaySec * 1000);
  }

  public clearAutoHideTimer() {
    if (this.autoHideTimer !== null) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
    this.isAutoHidden = false;
  }

  public isHidden(): boolean {
    return this.isAutoHidden;
  }
}

export const windowManager = new WindowManager();
