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
  private isPanelOpen: boolean = false;
  // Bubble size in CSS px (used for clamping only)
  private bubbleSize: number = 56;

  constructor() {
    this.updateScreenBounds();
    window.addEventListener('resize', () => this.updateScreenBounds());
  }

  public async updateScreenBounds() {
    if ((window as any).electronAPI?.getScreenBounds) {
      try {
        const bounds = await (window as any).electronAPI.getScreenBounds();
        if (bounds && bounds.width && bounds.height) {
          this.screenBounds = bounds;
          this.initPosition();
        }
      } catch (err) {
        console.warn('[WindowManager] Could not fetch screen bounds from Electron:', err);
      }
    } else {
      this.screenBounds = {
        width: window.innerWidth || 1920,
        height: window.innerHeight || 1080,
      };
      this.initPosition();
    }
    eventBus.emit('SCREEN_BOUNDS_CHANGED', this.screenBounds);
  }

  private initPosition() {
    // Spawn near the right edge, vertically centered
    this.position = {
      x: Math.max(0, this.screenBounds.width - this.bubbleSize - 16),
      y: Math.max(0, Math.floor(this.screenBounds.height / 2 - this.bubbleSize / 2)),
    };
    eventBus.emit('WINDOW_POSITION_CHANGED', this.position);
  }

  public setBubbleSize(size: number) {
    this.bubbleSize = size;
  }

  public setPanelOpen(open: boolean) {
    this.isPanelOpen = open;
    // No OS window resizing needed — panel is CSS-positioned absolutely
  }

  public getPosition(): Point {
    return { ...this.position };
  }

  public getScreenBounds(): ScreenBounds {
    return { ...this.screenBounds };
  }

  public setPosition(pos: Point, snapToEdge: boolean = true) {
    const size = this.bubbleSize;

    let targetX = Math.max(0, Math.min(pos.x, this.screenBounds.width - size));
    let targetY = Math.max(0, Math.min(pos.y, this.screenBounds.height - size));

    if (snapToEdge && !this.isPanelOpen) {
      const snapMargin = 80;
      if (targetX < snapMargin) {
        targetX = 0;
      } else if (targetX > this.screenBounds.width - snapMargin - size) {
        targetX = this.screenBounds.width - size;
      }
    }

    this.position = { x: targetX, y: targetY };
    eventBus.emit('WINDOW_POSITION_CHANGED', this.position);
  }

  public moveDelta(deltaX: number, deltaY: number) {
    const size = this.bubbleSize;
    const newX = Math.max(0, Math.min(this.position.x + deltaX, this.screenBounds.width - size));
    const newY = Math.max(0, Math.min(this.position.y + deltaY, this.screenBounds.height - size));
    this.position = { x: newX, y: newY };
    eventBus.emit('WINDOW_POSITION_CHANGED', this.position);
  }
}

export const windowManager = new WindowManager();
