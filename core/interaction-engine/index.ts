import { eventBus } from '../event-bus';

export class InteractionEngine {
  private activeHotkey: string = 'Ctrl+Space';

  public init() {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Check for Ctrl+Space or Alt+Space or Win+Space equivalent
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.code === 'Space') {
        e.preventDefault();
        eventBus.emit('HOTKEY_TOGGLE_TRIGGERED');
      }

      if (e.key === 'Escape') {
        eventBus.emit('ESCAPE_KEY_TRIGGERED');
      }
    });
  }

  public setGlobalHotkey(hotkey: string) {
    this.activeHotkey = hotkey;
    if ((window as any).electronAPI?.registerHotkey) {
      (window as any).electronAPI.registerHotkey(hotkey);
    }
  }

  public getGlobalHotkey(): string {
    return this.activeHotkey;
  }
}

export const interactionEngine = new InteractionEngine();
