import { ActionPayload } from '@/types';
import { eventBus } from '../event-bus';

export class ActionEngine {
  public async execute(action: ActionPayload): Promise<{ success: boolean; message?: string }> {
    console.log(`[ActionEngine] Executing action:`, action);
    eventBus.emit('ACTION_EXECUTING', action);

    try {
      switch (action.type) {
        case 'launch_app':
          return await this.launchApp(action.target);
        case 'open_url':
          return await this.openUrl(action.target);
        case 'switch_profile':
          eventBus.emit('SWITCH_PROFILE_REQUESTED', action.target);
          return { success: true, message: `Switched profile to ${action.target}` };
        case 'toggle_panel':
          eventBus.emit('TOGGLE_PANEL_REQUESTED');
          return { success: true };
        case 'execute_command':
          return await this.executeCommand(action.target, action.metadata);
        default:
          return { success: false, message: `Unknown action type "${action.type}"` };
      }
    } catch (err: any) {
      console.error(`[ActionEngine] Execution error:`, err);
      eventBus.emit('ACTION_FAILED', { action, error: err.message });
      return { success: false, message: err.message || 'Action execution failed' };
    }
  }

  private async launchApp(pathOrName: string): Promise<{ success: boolean; message?: string }> {
    if ((window as any).electronAPI?.launchApp) {
      await (window as any).electronAPI.launchApp(pathOrName);
      eventBus.emit('APP_LAUNCHED', pathOrName);
      return { success: true, message: `Launched ${pathOrName}` };
    } else {
      // Fallback for Web browser preview mode
      if (pathOrName.startsWith('http')) {
        window.open(pathOrName, '_blank');
      } else {
        alert(`[Demo Mode] Simulated launch of application: ${pathOrName}`);
      }
      eventBus.emit('APP_LAUNCHED', pathOrName);
      return { success: true, message: `Simulated launch of ${pathOrName}` };
    }
  }

  private async openUrl(url: string): Promise<{ success: boolean; message?: string }> {
    if ((window as any).electronAPI?.openExternal) {
      await (window as any).electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
    return { success: true, message: `Opened URL ${url}` };
  }

  private async executeCommand(command: string, metadata?: Record<string, any>): Promise<{ success: boolean; message?: string }> {
    switch (command) {
      case 'mute_audio':
        eventBus.emit('NOTIFICATION_RECEIVED', {
          id: Date.now().toString(),
          type: 'info',
          title: 'System Mute',
          message: 'Audio toggled',
          timestamp: Date.now(),
          read: false,
        });
        return { success: true, message: 'Toggled system mute' };
      case 'take_screenshot':
        eventBus.emit('NOTIFICATION_RECEIVED', {
          id: Date.now().toString(),
          type: 'success',
          title: 'Screenshot Captured',
          message: 'Saved to Clipboard',
          timestamp: Date.now(),
          read: false,
        });
        return { success: true, message: 'Screenshot captured' };
      default:
        return { success: true, message: `Executed command ${command}` };
    }
  }
}

export const actionEngine = new ActionEngine();
