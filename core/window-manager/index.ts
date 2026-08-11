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
  private position: Point = { x: 100, y: 100 };
  private screenBounds: ScreenBounds = { width: 1920, height: 1080 };
  private isAutoHidden: boolean = false;
  private autoHideTimer: number | null = null;
  private isPanelOpen: boolean = false;
  private windowSize: { width: number; height: number } = { width: 80, height: 80 };

  constructor() {
    this.updateScreenBounds();
    this.initPosition();
    window.addEventListener('resize', () => this.updateScreenBounds());
  }

  public async updateScreenBounds() {
    if ((window as any).electronAPI?.getScreenBounds) {
      try {
        const bounds = await (window as any).electronAPI.getScreenBounds();
        if (bounds && bounds.width && bounds.height) {
          this.screenBounds = bounds;
        }
      } catch (err) {
        console.warn('[WindowManager] Could not fetch screen bounds from Electron:', err);
      }
    } else {
      this.screenBounds = {
        width: window.innerWidth || 1920,
        height: window.innerHeight || 1080,
      };
    }
    eventBus.emit('SCREEN_BOUNDS_CHANGED', this.screenBounds);
  }

  private async initPosition() {
    if ((window as any).electronAPI?.getWindowPosition) {
      try {
        const pos = await (window as any).electronAPI.getWindowPosition();
        if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
          this.position = pos;
          return;
        }
      } catch (e) {}
    }
    this.position = {
      x: Math.max(0, this.screenBounds.width - 96),
      y: Math.max(0, Math.floor(this.screenBounds.height / 2 - 40)),
    };
  }

  public setPanelOpen(open: boolean) {
    this.isPanelOpen = open;
    const newWidth = open ? 500 : 80;
    const newHeight = open ? 740 : 80;
    this.windowSize = { width: newWidth, height: newHeight };

    let targetX = this.position.x;
    let targetY = this.position.y;

    if (open) {
      if (targetX + newWidth > this.screenBounds.width) {
        targetX = Math.max(0, this.screenBounds.width - newWidth - 10);
      }
      if (targetY + newHeight > this.screenBounds.height) {
        targetY = Math.max(0, this.screenBounds.height - newHeight - 10);
      }
    }

    if ((window as any).electronAPI?.setWindowSize) {
      (window as any).electronAPI.setWindowSize(newWidth, newHeight);
    }
    this.setPosition({ x: targetX, y: targetY }, false);
  }

  public getPosition(): Point {
    return this.position;
  }

  public getScreenBounds(): ScreenBounds {
    return this.screenBounds;
  }

  public setPosition(pos: Point, snapToEdge: boolean = true) {
    const currentW = this.windowSize.width;
    const currentH = this.windowSize.height;

    let targetX = Math.max(0, Math.min(pos.x, this.screenBounds.width - currentW));
    let targetY = Math.max(0, Math.min(pos.y, this.screenBounds.height - currentH));

    if (snapToEdge && !this.isPanelOpen) {
      const snapMargin = 80;
      if (targetX < snapMargin) {
        targetX = 0;
      } else if (targetX > this.screenBounds.width - snapMargin - currentW) {
        targetX = this.screenBounds.width - currentW;
      }
    }

    this.position = { x: targetX, y: targetY };
    eventBus.emit('WINDOW_POSITION_CHANGED', this.position);

    if ((window as any).electronAPI?.moveWindow) {
      (window as any).electronAPI.moveWindow(targetX, targetY);
    }
  }

  public moveDelta(deltaX: number, deltaY: number) {
    if ((window as any).electronAPI?.moveWindowDelta) {
      (window as any).electronAPI.moveWindowDelta(deltaX, deltaY);
      this.position.x += deltaX;
      this.position.y += deltaY;
      eventBus.emit('WINDOW_POSITION_CHANGED', this.position);
    } else {
      this.setPosition({ x: this.position.x + deltaX, y: this.position.y + deltaY }, false);
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
