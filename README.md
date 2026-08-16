# Desktop Action Hub

[![Windows](https://img.shields.io/badge/Windows%2010%20%7C%2011-0078D4?style=flat-square&logo=windows11&logoColor=white)](https://github.com/whitebeard10/desktop-quick-action)
[![Electron](https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white)](https://electronjs.org)
[![React](https://img.shields.io/badge/React%2018-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MIT License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

A floating Windows desktop overlay that keeps your most-used apps, system controls, and live widgets one click away — without covering your workspace.

It lives as a small draggable bubble on your screen edge. Click it to expand a full action panel. Click again (or press `Ctrl+Space`) to collapse it back.

---

## What it does

- **App Launcher** — open VS Code, Discord, YouTube Music, Calculator, Terminal, or any custom `.exe` or URL from a pinned grid
- **Quick Actions** — mute your audio, lock your PC, or launch Snipping Tool from the toolbar without touching your taskbar
- **Live Widgets** — 9 desktop widgets: weather, battery, clipboard history, calendar, notes, timer, media controls, downloads, and CPU/RAM monitor
- **Universal Search** — fuzzy search across your pinned apps and shortcuts
- **Profiles** — separate Work, Gaming, School, and Design layouts, each with their own pinned apps and accent color
- **Themes** — 7 built-in themes including Glass, AMOLED, and Fluent with real-time blur/opacity sliders

---

## Getting started

**Requirements:** Node.js 18+, Windows 10 or 11

```bash
git clone https://github.com/whitebeard10/desktop-quick-action.git
cd desktop-quick-action
npm install
npm run build
.\launch.bat
```

The app starts as a floating bubble near the center of your screen. Click it to open the panel.

For development with hot reload:
```bash
npm run dev
```

---

## Adding apps to the launcher

### From inside the app

1. Press `Ctrl + Space` to open the panel
2. Go to the **App Launcher** tab
3. Click **+ Add App** (top right)
4. Fill in the name, path or URL, type, and category
5. Save — it persists automatically

For the path field:
- Desktop apps: `C:\Program Files\App\app.exe` or just `calc.exe` for system apps
- Websites: `https://github.com`
- Protocol URIs: `discord:`, `spotify:`, `calculator:`

### From the source (for default presets)

Edit the `INITIAL_APPS` array in `src/store/useAppStore.ts`:

```typescript
{
  id: 'a-my-app',           // unique ID
  title: 'My App',
  icon: 'Code2',            // any Lucide icon name — lucide.dev
  pathOrUrl: 'myapp.exe',   // exe, URL, or alias
  type: 'exe',              // 'exe' | 'url' | 'folder' | 'script'
  category: 'Development',  // 'Work' | 'Development' | 'Media' | 'Gaming' | 'Utilities'
  isPinned: true,
  launchCount: 0,
  profileId: 'p-work'       // 'p-work' | 'p-gaming' | 'p-school' | 'p-design'
}
```

Run `npm run build` after editing. Changes persist to localStorage on first load.

---

## Keyboard shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Space` | Toggle panel open / closed |
| `Escape` | Close the panel |

---

## Project layout

```
├── core/               # Engine layer — window management, search, events, widgets
├── electron/           # Main process and preload IPC bridge
├── src/
│   ├── components/     # Bubble, panel, launcher, widgets, profiles, themes, settings
│   ├── store/          # Zustand store with localStorage persistence and migration
│   ├── styles/         # Tailwind base + glassmorphism utilities
│   └── types/          # Shared TypeScript interfaces
├── electron.vite.config.ts
├── launch.bat
└── package.json
```

---

## Tech

Built on [Electron](https://electronjs.org) + [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org), bundled with [electron-vite](https://electron-vite.org). State via [Zustand](https://zustand-demo.pmnd.rs). Animations via [Framer Motion](https://www.framer.com/motion). Icons from [Lucide](https://lucide.dev).

---

## Contributing

1. Fork and clone
2. `npm install`
3. Create a branch: `git checkout -b feat/your-feature`
4. Commit with [conventional commits](https://www.conventionalcommits.org): `git commit -m "feat: add X"`
5. Open a PR

---

## License

MIT — see [LICENSE](LICENSE)
