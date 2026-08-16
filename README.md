# Desktop Action Hub

[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D4?style=flat-square&logo=windows11&logoColor=white)](https://github.com/whitebeard10/desktop-quick-action)
[![Electron](https://img.shields.io/badge/Electron-30.0-47848F?style=flat-square&logo=electron&logoColor=white)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

An open-source, high-performance floating desktop assistant and productivity overlay for Windows. **Desktop Action Hub** pairs a minimal floating bubble with a powerful 1-click action panel—delivering instant app launching, system automation, live widgets, and universal search directly over your active workspace.

---

## Key Features

- 🫧 **Floating Desktop Overlay**: Always-on-top, edge-snapping floating bubble with hardware telemetry rings (CPU/RAM) and notification indicators.
- 🚀 **1-Click App Launcher**: Native desktop launcher supporting applications (VS Code, Discord Desktop, YouTube Music, Windows Calculator, Terminal) and custom Web URLs.
- ⚡ **Native System Actions**: Direct Windows API integration for **Master Audio Mute**, **Screen Capture (Snipping Tool)**, and **Workstation Lock**.
- 🔍 **Universal Fuzzy Search**: Fast in-memory search index (<5ms latency) across pinned apps, system commands, settings, and web shortcuts.
- 📊 **9 Live Desktop Widgets**: Weather forecast, battery monitor, clipboard history, calendar, note pad, timer/stopwatch, media controls, downloads, and system telemetry.
- 👤 **Contextual Profiles**: Work, Gaming, School, and Design profiles with isolated app shortcuts, accent themes, and widget layouts.
- 🎨 **Windows 11 Fluent Aesthetics**: Modern glassmorphism design system supporting 7 custom themes (Glass, Dark, Light, AMOLED, Minimal, Material, Fluent) with real-time blur and opacity controls.
- ⌨️ **Global Hotkey**: Toggle the action panel from anywhere in Windows using `Ctrl + Space`.

---

## Architecture & System Engines

Desktop Action Hub is engineered with a modular, event-driven engine architecture to ensure near-zero CPU overhead when idle and instant responsiveness under load.

```
core/
├── action-engine/          # Centralized action dispatcher for desktop & system API calls
├── window-manager/         # OS window bounds, Z-order positioning, and screen alignment
├── interaction-engine/     # Global hotkeys, pointer tracking, and drag state machine
├── event-bus/              # Low-overhead pub/sub event channel
├── service-layer/          # Native system integrations (Audio, Capture, Telemetry, Power)
├── search-engine/          # In-memory fuzzy search indexer and ranker
└── widget-runtime/         # Widget state lifecycle and update scheduler
```

### Key Technical Highlights
- **Pointer Drag Engine**: Custom pointer capture screen tracking (`screenX`/`screenY`) that bypasses Windows Chromium non-client drag limitations for smooth 60fps window repositioning without blocking DOM click events.
- **Exact-Fit OS Windowing**: Dynamically resizes the underlying Electron `BrowserWindow` to eliminate dead-pixel desktop coverage when collapsed to bubble mode.
- **Top-Level Z-Ordering**: Enforces top-level Z-order visibility above full-screen and maximized applications without interfering with active focus.

---

## Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Windows 10 or 11**

### Quick Launch (Batch Script)
To start Desktop Action Hub locally on Windows:
```powershell
.\launch.bat
```

### Development & Build Setup

```bash
# Clone repository
git clone https://github.com/whitebeard10/desktop-quick-action.git
cd desktop-quick-action

# Install dependencies
npm install

# Start Vite renderer dev server
npm run dev

# Build production Electron main & renderer bundles
npm run build
```

---

## Quick Actions & Shortcuts

| Action | Execution / Method | Shortcut |
| :--- | :--- | :--- |
| **Toggle Action Panel** | System-wide overlay toggle | `Ctrl + Space` |
| **Mute Master Audio** | Windows Virtual Key `VK_VOLUME_MUTE` | Quick Action Bar |
| **Screen Capture** | Windows Snipping Tool (`ms-screenclip:`) | Quick Action Bar |
| **Lock Workstation** | `rundll32.exe user32.dll,LockWorkStation` | Quick Action Bar |
| **Open Terminal** | Interactive PowerShell / Windows Terminal | Quick Action Bar |

---

## Adding Custom Applications & Shortcuts

You can easily add custom desktop applications, executable files, web shortcuts, or scripts to the App Launcher grid:

### Option A: Via the In-App Modal (Recommended)
1. Open Desktop Action Hub (`Ctrl + Space`).
2. Go to the **App Launcher** tab.
3. Click the green **`+ Add App`** button in the upper right.
4. Fill in the modal fields:
   - **Title**: Display name (e.g., *Photoshop*, *Spotify*, *GitHub Desktop*).
   - **Executable Path or URL**:
     - For Desktop Apps: Full executable path (e.g. `C:\Program Files\Adobe\Photoshop.exe` or `calc.exe`).
     - For Web Apps: Full website URL (e.g. `https://github.com`).
     - For Protocols: Custom URI protocol (e.g. `discord:`, `spotify:`, `calculator:`).
   - **Type**: Select `EXE / Application`, `Website URL`, `Folder`, or `Script`.
   - **Category**: Assign to `Work`, `Development`, `Media`, `Gaming`, or `Utilities`.
5. Click **Save App**. The new shortcut appears in the grid and is automatically persisted.

### Option B: Modifying Default App Presets
To edit default application presets for all fresh installations, edit the `INITIAL_APPS` array in `src/store/useAppStore.ts`:

```typescript
{
  id: 'a-my-app',
  title: 'My Desktop App',
  icon: 'Code2', // Any Lucide React icon name
  pathOrUrl: 'C:\\Program Files\\App\\app.exe', // Or URL / alias
  type: 'exe',
  category: 'Development',
  isPinned: true,
  launchCount: 0,
  profileId: 'p-work'
}
```

---

## Project Structure

```
desktop-quick-action/
├── core/                   # Decoupled core logic & system engines
├── electron/               # Electron main process, IPC handlers & preload API
├── src/                    # React UI layer
│   ├── components/         # Floating bubble, Action panel, Widgets, Launcher
│   ├── store/              # Zustand state store with auto-migrated persistence
│   ├── styles/             # Tailwind CSS & acrylic glassmorphic tokens
│   ├── types/              # TypeScript definitions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # React DOM entry point
├── launch.bat              # One-click Windows local launcher
├── electron.vite.config.ts # Vite configuration for main process & renderer
└── package.json
```

---

## Contributing

Contributions are welcome! Follow these steps to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to origin (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
