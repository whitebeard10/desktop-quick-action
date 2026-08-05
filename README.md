# ⚡ Desktop Action Hub

> A floating, always-accessible Windows 11 desktop assistant that puts app launching, universal search, live widgets, and workflow automation one click away.

![Platform](https://img.shields.io/badge/platform-Windows%2011-0078D4?logo=windows11&logoColor=white)
![Built With](https://img.shields.io/badge/built%20with-Electron%20%2B%20React%20%2B%20TypeScript-61DAFB?logo=electron&logoColor=white)
![Vite](https://img.shields.io/badge/bundler-Vite%206-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/styling-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/animations-Framer%20Motion-E91E63?logo=framer&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![GitHub stars](https://img.shields.io/github/stars/whitebeard10/desktop-quick-action?style=social)
![GitHub forks](https://img.shields.io/github/forks/whitebeard10/desktop-quick-action?style=social)

---

## 🎯 What is Desktop Action Hub?

**Desktop Action Hub** is a modern, production-grade floating desktop assistant inspired by **Windows 11 Fluent Design**, **Samsung Edge Panel**, and **iOS AssistiveTouch**. It lives as a draggable bubble on your screen edge — click to expand a rich action panel with app launching, universal search, 9 live widgets, desktop profiles, 7 built-in themes, and a plugin system.

### ✨ Key Features at a Glance

| Feature | Description |
|---|---|
| 🫧 **Floating Bubble** | Draggable, edge-snapping, always-on-top bubble with CPU ring indicator & notification badge |
| 🚀 **1-Click App Launcher** | Launch EXEs, URLs, folders, and scripts with category filters and pinning |
| 🔍 **Universal Search** | Instant fuzzy search across apps, files, commands, and web bookmarks |
| 📊 **9 Live Widgets** | Weather, Battery, Clipboard Manager, Calendar, Notes, Timer, Music, Downloads, CPU/RAM Monitor |
| 👤 **4 Desktop Profiles** | Work, Gaming, School, Design — switch pinned apps, widgets, and accent colors in 1 click |
| 🎨 **7 Built-in Themes** | Glass, Dark, Light, AMOLED, Minimal, Material, Fluent — with live customization sliders |
| ⌨️ **Global Hotkeys** | `Ctrl+Space` / `Alt+Space` / `Win+Space` to toggle from anywhere |
| 🔌 **Plugin System** | Modular plugin architecture with manifest parsing, permission sandboxing, and API bridge |
| 🔔 **Notification Manager** | Badge counter, toast stack, priority queuing, and notification history |
| ⚡ **Quick Actions Bar** | Mute Audio, Screenshot, Launch Terminal, Lock System — all from the panel toolbar |

---

## 🏗️ Architecture — 12 Core Engines

Desktop Action Hub is built on a **production-grade, decoupled architecture** with 12 foundational engines powering all functionality:

```
core/
├── action-engine/          → Centralized execution dispatcher for all user actions
├── window-manager/         → Window geometry, edge docking, auto-hide, multi-monitor
├── interaction-engine/     → Global hotkeys, mouse drag, hover timers, gestures
├── bubble-state-machine/   → FSM: Idle → Hover → Dragging → Expanded → Hidden → Notification
├── event-bus/              → Typed pub/sub message broker decoupling all components
├── widget-runtime/         → Widget lifecycle: registration, scheduling, refresh, telemetry
├── plugin-host/            → Plugin manifest parser, permission sandbox, API bridge
├── service-layer/          → System services (CPU, Battery, Clipboard, Weather, Media, Downloads)
├── repository/             → Structured persistence layer (LocalStorage / SQLite)
├── search-engine/          → In-memory fuzzy indexer & ranker (<5ms response time)
├── notification-manager/   → Badge calculation, toast stack, priority queue, history
└── animation-system/       → Framer Motion spring presets & Fluent timing standards
```

> UI components **never** execute business logic directly — all actions flow through the **Action Engine**, all data through the **Event Bus**, and all state through the **Bubble State Machine**.

---

## 🖼️ Screenshots

> _Coming soon — run locally to preview the full UI experience._

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | [Electron](https://www.electronjs.org/) — Frameless, transparent, always-on-top native window |
| **UI Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 6](https://vite.dev/) — Instant HMR dev server |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) — Windows 11 Acrylic & Glassmorphism utilities |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) — 60 FPS spring physics animations |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) — Lightweight reactive state management |
| **Icons** | [Lucide React](https://lucide.dev/) — Beautiful open-source icon set |
| **Typography** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) via Google Fonts |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Windows 10/11** (for Electron native features)

### Installation

```bash
# Clone the repository
git clone https://github.com/whitebeard10/desktop-quick-action.git
cd desktop-quick-action

# Install dependencies
npm install

# Start the development server (browser preview)
npm run dev

# Build for production
npm run build
```

### Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR at `http://localhost:3000` |
| `npm run build` | TypeScript check + Vite production build to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## 📂 Project Structure

```
desktop-quick-action/
├── core/                       # 12 Foundational Architecture Engines
│   ├── action-engine/          # Centralized action dispatcher
│   ├── animation-system/       # Framer Motion spring presets & timing
│   ├── bubble-state-machine/   # Finite State Machine for bubble lifecycle
│   ├── event-bus/              # Typed pub/sub event channel
│   ├── interaction-engine/     # Global hotkey & gesture controller
│   ├── notification-manager/   # Badge counter & toast notifications
│   ├── plugin-host/            # Plugin manifest parser & permission sandbox
│   ├── repository/             # Structured persistence layer
│   ├── search-engine/          # Fuzzy search indexer & ranker
│   ├── service-layer/          # System services (CPU, Battery, Clipboard, etc.)
│   └── widget-runtime/         # Widget lifecycle manager
├── electron/                   # Electron main process & preload
│   ├── main.ts                 # Frameless transparent window & IPC handlers
│   └── preload.ts              # Secure ContextBridge API
├── src/                        # React UI Layer
│   ├── components/
│   │   ├── bubble/             # Floating Bubble component
│   │   ├── panel/              # Expandable Action Panel
│   │   ├── launcher/           # App Launcher with categories & Add modal
│   │   ├── search/             # Universal Search with fuzzy matching
│   │   ├── widgets/            # 9 Mini Widgets (Weather, Battery, etc.)
│   │   ├── profiles/           # Desktop Profile Switcher
│   │   ├── themes/             # Theme Customizer (7 presets + sliders)
│   │   └── settings/           # Settings Dashboard
│   ├── store/                  # Zustand state management
│   ├── types/                  # TypeScript type definitions
│   ├── styles/                 # Tailwind CSS & Acrylic effects
│   ├── App.tsx                 # Root application component
│   └── main.tsx                # Vite entry point
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🧩 Widgets

| Widget | Description | Refresh Rate |
|---|---|---|
| ☁️ **Weather** | Live temperature, condition, humidity, wind, 3-day forecast | 10 min |
| 🔋 **Battery** | Real-time charge level meter, charging state, fast charge indicator | 10 sec |
| 📋 **Clipboard** | Copied snippet history, 1-click copy back, pin favorites | On event |
| 📅 **Calendar** | Month grid view, today highlight, day-of-week display | 1 min |
| 📝 **Notes** | Profile-isolated markdown scratchpad with auto-save | On edit |
| ⏱️ **Timer** | Stopwatch with lap times + 5-minute countdown timer | 1 sec |
| 🎵 **Music** | Media playback controls, track metadata, seek progress bar | 1 sec |
| 📥 **Downloads** | Active & completed downloads, progress bars, open folder | 5 sec |
| 💻 **CPU & RAM** | Real-time CPU % and RAM MB telemetry gauges | 2 sec |

---

## 🎨 Themes

| Theme | Style | Mode |
|---|---|---|
| **Glass** | Windows 11 Acrylic transparency with deep blur | Dark |
| **Dark** | Sleek dark with blue accent | Dark |
| **Light** | Fluent light with subtle shadows | Light |
| **AMOLED** | Pure pitch black for OLED displays | Dark |
| **Minimal** | Clean slate with emerald accents | Dark |
| **Material** | Material You vibrant purple & pink gradients | Dark |
| **Fluent** | Windows 11 Mica with system accent colors | Dark |

Each theme supports live customization:
- 🎨 **Accent Color** picker (7 preset colors)
- 📏 **Bubble Size** slider (40px — 80px)
- 🔘 **Corner Radius** slider (0px — 32px)
- 🌫️ **Glass Blur Intensity** slider (4px — 40px)
- 👻 **Idle Transparency** slider (20% — 100%)

---

## 👤 Desktop Profiles

| Profile | Accent | Pinned Apps | Active Widgets |
|---|---|---|---|
| 💼 **Work** | Blue `#0078d4` | VS Code, Chrome, Terminal, Notion | Weather, Notes, Calendar, CPU/RAM |
| 🎮 **Gaming** | Purple `#a855f7` | Steam, Discord, Spotify | CPU/RAM, Music, Battery |
| 📚 **School** | Green `#10b981` | Chrome, Notion, Spotify | Notes, Timer, Calendar |
| 🎨 **Design** | Pink `#ec4899` | Figma, Chrome, Notion | Clipboard, Music, Weather |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Space` | Toggle Action Panel (default) |
| `Alt + Space` | Toggle Action Panel (alternate) |
| `Escape` | Close Action Panel |
| `↑` / `↓` | Navigate search results |
| `Enter` | Execute selected search result |

---

## 🔌 Plugin System

Desktop Action Hub includes a modular plugin framework with manifest-based registration:

| Plugin | Description | Permissions |
|---|---|---|
| 🎵 **Spotify Integration** | Control playback, view current track | `media`, `notifications` |
| 💬 **Discord Quick Status** | Unread badges, toggle mute/deafen | `notifications`, `internet` |
| 🌐 **Chrome Tabs & History** | Search open tabs and bookmarks | `filesystem`, `internet` |
| 📁 **File Explorer Helper** | Quick access folders, recent files | `filesystem` |

Plugins can be toggled on/off from **Settings → Plugins**.

---

## 🗺️ Roadmap

- [ ] AI-powered smart actions & workflow automation
- [ ] Voice command integration
- [ ] Cloud sync for profiles & settings
- [ ] Third-party widget marketplace
- [ ] macOS & Linux cross-platform support
- [ ] Drag-and-drop widget reordering
- [ ] Custom automation scripting engine
- [ ] System tray integration & context menus

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## ⭐ Star This Repo

If you find Desktop Action Hub useful, please consider giving it a ⭐ on GitHub — it helps others discover the project!

---

<p align="center">
  Built with ❤️ using Electron, React, TypeScript, Framer Motion & Tailwind CSS
</p>
