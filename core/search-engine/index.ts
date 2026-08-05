import { SearchResultItem, AppItem } from '@/types';

export class SearchEngine {
  private index: SearchResultItem[] = [];

  public initializeIndex(apps: AppItem[], recentFiles: Array<{ id: string; name: string; path: string }>) {
    const items: SearchResultItem[] = [];

    // Index installed apps & favorites
    apps.forEach((app) => {
      items.push({
        id: `app-${app.id}`,
        title: app.title,
        subtitle: `App • ${app.category} • ${app.pathOrUrl}`,
        category: 'app',
        icon: app.icon,
        action: {
          type: app.type === 'url' ? 'open_url' : 'launch_app',
          target: app.pathOrUrl,
        },
        score: app.launchCount * 10 + (app.isPinned ? 50 : 0),
      });
    });

    // Index system commands & shortcuts
    const systemCommands: SearchResultItem[] = [
      {
        id: 'cmd-calc',
        title: 'Calculator',
        subtitle: 'System Utility',
        category: 'command',
        icon: 'Calculator',
        action: { type: 'launch_app', target: 'calc.exe' },
        score: 40,
      },
      {
        id: 'cmd-terminal',
        title: 'Windows Terminal / PowerShell',
        subtitle: 'Developer Command Prompt',
        category: 'command',
        icon: 'Terminal',
        action: { type: 'launch_app', target: 'powershell.exe' },
        score: 45,
      },
      {
        id: 'cmd-mute',
        title: 'Toggle System Mute',
        subtitle: 'Quick Action',
        category: 'command',
        icon: 'VolumeX',
        action: { type: 'execute_command', target: 'mute_audio' },
        score: 30,
      },
      {
        id: 'cmd-screenshot',
        title: 'Take Screenshot',
        subtitle: 'Quick Action',
        category: 'command',
        icon: 'Camera',
        action: { type: 'execute_command', target: 'take_screenshot' },
        score: 35,
      },
    ];

    items.push(...systemCommands);

    // Index recent files
    recentFiles.forEach((file) => {
      items.push({
        id: `file-${file.id}`,
        title: file.name,
        subtitle: `File • ${file.path}`,
        category: 'file',
        icon: 'FileText',
        action: { type: 'launch_app', target: file.path },
        score: 20,
      });
    });

    this.index = items;
  }

  public search(query: string, limit: number = 8): SearchResultItem[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.index.slice(0, limit);
    }

    return this.index
      .map((item) => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const subtitleLower = item.subtitle.toLowerCase();

        if (titleLower === q) score += 100;
        else if (titleLower.startsWith(q)) score += 60;
        else if (titleLower.includes(q)) score += 30;

        if (subtitleLower.includes(q)) score += 10;

        return { ...item, score: score + item.score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export const searchEngine = new SearchEngine();
