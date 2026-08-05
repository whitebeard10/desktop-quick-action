export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: Array<'filesystem' | 'clipboard' | 'notifications' | 'internet' | 'media' | 'window_control'>;
  enabled: boolean;
}

export class PluginHost {
  private plugins: Map<string, PluginManifest> = new Map([
    [
      'spotify',
      {
        id: 'spotify',
        name: 'Spotify Integration',
        version: '1.0.0',
        description: 'Control Spotify playback, view current track, and manage playlists.',
        author: 'Desktop Hub Team',
        permissions: ['media', 'notifications'],
        enabled: true,
      },
    ],
    [
      'discord',
      {
        id: 'discord',
        name: 'Discord Quick Status',
        version: '1.0.0',
        description: 'Displays unread message badges and lets you toggle mute/deafen.',
        author: 'Community',
        permissions: ['notifications', 'internet'],
        enabled: true,
      },
    ],
    [
      'chrome',
      {
        id: 'chrome',
        name: 'Chrome Tabs & History',
        version: '1.1.0',
        description: 'Instant search across open Chrome tabs and browser bookmarks.',
        author: 'Desktop Hub Team',
        permissions: ['filesystem', 'internet'],
        enabled: true,
      },
    ],
    [
      'explorer',
      {
        id: 'explorer',
        name: 'File Explorer Helper',
        version: '1.0.0',
        description: 'Quick access to quick access folders, recent downloads, and file previews.',
        author: 'System',
        permissions: ['filesystem'],
        enabled: true,
      },
    ],
  ]);

  public getPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  public togglePlugin(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = !plugin.enabled;
      return plugin.enabled;
    }
    return false;
  }
}

export const pluginHost = new PluginHost();
