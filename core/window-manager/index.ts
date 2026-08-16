import { eventBus } from '../event-bus';

export interface Point {
  x: number;
  y: number;
}

export interface ScreenBounds {
  width: number;
  height: number;
}

export interface PanelLayoutState {
  isOpen: boolean;
  side: 'left' | 'right';
  bubbleRelX: number;
  bubbleRelY: number;
  panelRelX: number;
  panelRelY: number;
  winW: number;
  winH: number;
}

// Layout constants (must match ActionPanel.tsx)
const BUBBLE_SIZE_DEFAULT = 56;
const PANEL_W = 460;
const PANEL_H = 680;
const GAP = 8; // gap between bubble and panel edge

export class WindowManager {
  private position: Point = { x: 100, y: 100 };
  private screenBounds: ScreenBounds = { width: 1920, height: 1080 };
  private isPanelOpen: boolean = true;
  private bubbleSize: number = BUBBLE_SIZE_DEFAULT;
  private currentLayout: PanelLayoutState = {
    isOpen: true,
    side: 'right',
    bubbleRelX: 0,
    bubbleRelY: 0,
    panelRelX: BUBBLE_SIZE_DEFAULT + GAP,
    panelRelY: 0,
    winW: BUBBLE_SIZE_DEFAULT + GAP + PANEL_W,
    winH: PANEL_H,
  };

  constructor() {
    this.updateScreenBounds();
    window.addEventListener('resize', () => this.updateScreenBounds());

    // Sync position changes when OS window is moved natively via WebkitAppRegion: drag
    const api = (window as any).electronAPI;
    if (api?.onPositionChanged) {
      api.onPositionChanged((pos: Point) => {
        if (!this.isPanelOpen) {
          this.position = pos;
        } else {
          this.position = {
            x: pos.x + this.currentLayout.bubbleRelX,
            y: pos.y + this.currentLayout.bubbleRelY,
          };
        }
        eventBus.emit('WINDOW_POSITION_CHANGED', this.position);
      });
    }
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

  private async initPosition() {
    const api = (window as any).electronAPI;
    if (api?.getWindowPosition) {
      try {
        const pos = await api.getWindowPosition();
        if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
          this.position = pos;
          eventBus.emit('WINDOW_POSITION_CHANGED', this.position);
          return;
        }
      } catch (err) {
        console.warn('[WindowManager] Could not fetch window position from Electron:', err);
      }
    }
    this.position = {
      x: 300,
      y: 200,
    };
    eventBus.emit('WINDOW_POSITION_CHANGED', this.position);
  }

  public setBubbleSize(size: number) {
    this.bubbleSize = size;
  }

  public getLayoutState(): PanelLayoutState {
    return { ...this.currentLayout };
  }

  // Called when panel open/close state changes.
  // Resizes the OS window and repositions it to keep everything on-screen.
  public setPanelOpen(open: boolean) {
    this.isPanelOpen = open;
    const api = (window as any).electronAPI;

    if (open) {
      // Determine which side the panel opens on based on available right screen space
      const spaceRight = this.screenBounds.width - (this.position.x + this.bubbleSize);
      const openLeft = spaceRight < PANEL_W + GAP;
      const side: 'left' | 'right' = openLeft ? 'left' : 'right';

      // Combined window width & height
      const winW = this.bubbleSize + GAP + PANEL_W;
      const winH = Math.max(this.bubbleSize, PANEL_H);

      // Clamp window Y so window doesn't go off bottom of workArea
      const winY = Math.max(0, Math.min(this.position.y, this.screenBounds.height - winH));
      const winX = openLeft
        ? this.position.x - GAP - PANEL_W
        : this.position.x;

      const bubbleRelX = openLeft ? PANEL_W + GAP : 0;
      const bubbleRelY = this.position.y - winY;

      const panelRelX = openLeft ? 0 : this.bubbleSize + GAP;
      const panelRelY = 0;

      this.currentLayout = {
        isOpen: true,
        side,
        bubbleRelX,
        bubbleRelY,
        panelRelX,
        panelRelY,
        winW,
        winH,
      };

      if (api?.setWindowSize && api?.moveWindow) {
        api.setWindowSize(winW, winH);
        api.moveWindow(winX, winY);
      }
    } else {
      this.currentLayout = {
        isOpen: false,
        side: 'right',
        bubbleRelX: 0,
        bubbleRelY: 0,
        panelRelX: 0,
        panelRelY: 0,
        winW: this.bubbleSize,
        winH: this.bubbleSize,
      };

      if (api?.setWindowSize && api?.moveWindow) {
        api.setWindowSize(this.bubbleSize, this.bubbleSize);
        api.moveWindow(this.position.x, this.position.y);
      }
    }

    eventBus.emit('PANEL_LAYOUT_CHANGED', this.currentLayout);
  }

  public getPosition(): Point {
    return { ...this.position };
  }

  public getScreenBounds(): ScreenBounds {
    return { ...this.screenBounds };
  }

  // Move bubble (and OS window) to an absolute screen position
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

    // Physically move the OS window
    const api = (window as any).electronAPI;
    if (api?.moveWindow) {
      api.moveWindow(targetX, targetY);
    }
  }

  public syncPositionFromOS() {
    // Handled by onPositionChanged IPC listener
  }

  /** @deprecated Use setPosition() for programmatic movement. */
  public moveDelta(deltaX: number, deltaY: number) {
    const size = this.bubbleSize;
    const newX = Math.max(0, Math.min(this.position.x + deltaX, this.screenBounds.width - size));
    const newY = Math.max(0, Math.min(this.position.y + deltaY, this.screenBounds.height - size));
    this.position = { x: newX, y: newY };
    eventBus.emit('WINDOW_POSITION_CHANGED', this.position);
  }
}

export const windowManager = new WindowManager();
