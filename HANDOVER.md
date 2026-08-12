# Desktop QuickAction — Handover Document
**Date:** 2026-08-12  
**Branch:** `main` — latest commit `10db546`

---

## What This App Is

A Windows desktop overlay app (Electron + React + Vite) that shows a small floating bubble anywhere on screen. Clicking the bubble opens an "Action Panel" with app launchers, widgets, search, profiles, themes, and settings. The bubble is always-on-top and draggable.

---

## Current State of the Codebase

### Architecture (as of last commit)
The app currently uses a **full-screen transparent overlay** approach:
- Electron window: `x:0, y:0, width:screenWidth, height:screenHeight`, transparent, frameless, always-on-top
- Bubble positioned via `position: fixed; left: pos.x; top: pos.y` CSS
- Panel positioned via `position: fixed` with smart left/right placement near bubble
- Pass-through for desktop interaction via `setIgnoreMouseEvents(true, { forward: true })`
- Pass-through toggled in **main process** using `webContents.on('cursor-changed')` event

### What Works
- ✅ App launches and renders correctly
- ✅ Bubble appears at right edge, vertically centered
- ✅ Hover effect on bubble registers (glow, scale)
- ✅ Cursor-based pass-through detection (main process `cursor-changed` event)
- ✅ Panel open/close IPC (`panel:state-changed`) so cursor:default text labels don't re-enable pass-through accidentally
- ✅ Build compiles cleanly (1974 modules)
- ✅ Git pushed to `github.com/whitebeard10/desktop-quick-action`

### Current Bugs / Unresolved Issues
1. **Desktop clicks are blocked** — The full-screen transparent window blocks all desktop interaction (clicking icons, taskbar, other apps). The `cursor-changed` + `setIgnoreMouseEvents` approach is supposed to fix this but the user reports it still blocks.
2. **Clicking the bubble is unreliable** — Even though hover registers, actually clicking the bubble sometimes doesn't work due to Electron's `setIgnoreMouseEvents` race conditions.
3. **Position drift when dragging** — May still have minor drift depending on render timing.

---

## Why the Current Architecture Has Problems

```
Full-screen transparent window (1920×1080)
│
├── setIgnoreMouseEvents(true, {forward:true}) = transparent areas pass through
├── cursor-changed event in main = toggles ignore off when cursor is 'grab'/'pointer'
│
└── Problems:
    ├── cursor-changed may not fire reliably on all systems
    ├── Race condition: cursor:default text in panel re-enables pass-through briefly
    └── If setIgnoreMouseEvents gets stuck, entire desktop becomes unclickable
```

---

## The Agreed Better Architecture (NOT YET IMPLEMENTED)

### Core Idea: Exact-Fit OS Window + Native OS Dragging

**Go back to a small, properly-sized window — but fix the dragging.**

```
State 1 — Bubble only:              State 2 — Panel open:
┌──────┐                            ┌──────┬────────────────────────┐
│  🫧  │  ← 56×56 OS window         │  🫧  │     Action Panel       │
└──────┘                            │      │     460×680            │
                                    └──────┴────────────────────────┘
                                    ← single OS window, exact fit →
```

### Why The Old Small Window Failed (Root Cause)
The original small-window used **Framer Motion `drag`** which moves the CSS element **within the window bounds**, not the OS window. The bubble appeared "caged" inside the tiny 80×80 window.

Additionally, `WebkitAppRegion: 'drag'` AND Framer Motion drag were both active — they conflicted.

### The Fix
Use **only** `WebkitAppRegion: 'drag'` on the bubble (native OS-level window drag). This:
- Lets the OS move the window anywhere on screen with zero lag
- No "cage" — window physically travels across the entire desktop
- No IPC needed for dragging
- No `setIgnoreMouseEvents` needed at all (window is exactly as big as content)

---

## Implementation Plan (For Next Session)

### Step 1 — Revert to small window in `electron/main.ts`
```typescript
mainWindow = new BrowserWindow({
  x: defaultX,       // near right edge
  y: defaultY,       // vertically centered
  width: 56,         // initial bubbleSize
  height: 56,
  frame: false,
  transparent: true,
  alwaysOnTop: true,
  resizable: false,
  skipTaskbar: true,
  // NO setIgnoreMouseEvents at all
});
```
- Remove ALL `setIgnoreMouseEvents` calls
- Remove `cursor-changed` event handler
- Remove `panel:state-changed` IPC handler
- Keep `system:screen-bounds`, `app:launch`, `system:metrics`
- Keep `window:set-size` and `window:move` IPC handlers (needed for panel resize + drag)

### Step 2 — Fix Window Manager (`core/window-manager/index.ts`)
The WindowManager should:
- Track bubble position in memory
- On `setPanelOpen(true)`: call `electronAPI.setWindowSize(524, 680)` then `electronAPI.moveWindow(x, y)` (repositioned to keep on screen)
- On `setPanelOpen(false)`: call `electronAPI.setWindowSize(bubbleSize, bubbleSize)` then `electronAPI.moveWindow(x, y)`
- `setPosition()`: call `electronAPI.moveWindow(x, y)` to physically move the OS window

### Step 3 — Fix FloatingBubble (`src/components/bubble/FloatingBubble.tsx`)
```tsx
// Bubble is position:relative (fills the OS window, not fixed)
// Use WebkitAppRegion: 'drag' on the outer div
// Use WebkitAppRegion: 'no-drag' on the button inside (so click works)
// Remove ALL Framer Motion drag props
// Remove onDrag, onDragEnd handlers
// Keep onClick for panel toggle
```

### Step 4 — Fix App.tsx
```tsx
// Root div is NOT full-screen overlay
// Just: width: 100%, height: 100%, background: transparent
// No pointer-events: none
```

### Step 5 — Fix ActionPanel (`src/components/panel/ActionPanel.tsx`)
```tsx
// Remove position: fixed — panel renders inside the OS window normally
// Panel header bar has WebkitAppRegion: 'drag' (to drag whole app when panel open)
// Panel content has WebkitAppRegion: 'no-drag'
```

### Step 6 — Restore IPC handlers in `electron/preload.ts`
```typescript
moveWindow: (x, y) => ipcRenderer.invoke('window:move', x, y),
setWindowSize: (w, h) => ipcRenderer.invoke('window:set-size', w, h),
// Remove: setIgnoreMouseEvents, setPanelOpen
```

---

## File Reference Map

| File | Role |
|------|------|
| `electron/main.ts` | Electron main process: window creation, IPC handlers, tray |
| `electron/preload.ts` | IPC bridge between main and renderer |
| `core/window-manager/index.ts` | Tracks bubble position, handles panel resize logic |
| `core/event-bus/index.ts` | Simple typed pub/sub (has `on`, `off`, `emit`) |
| `core/bubble-state-machine/index.ts` | Bubble FSM: idle → hover → expanded |
| `src/App.tsx` | Root React component |
| `src/components/bubble/FloatingBubble.tsx` | The draggable floating bubble UI |
| `src/components/panel/ActionPanel.tsx` | The expanding action panel (tabs, widgets, etc.) |
| `src/store/useAppStore.ts` | Zustand store: all app state + actions |
| `launch.bat` | Fast launch script (uses cached build if available) |

---

## Key Constants
```
Default bubble size:  56px
Panel width:          460px
Panel height:         680px
Gap (bubble to panel):  8px
Combined window W:    56 + 8 + 460 = 524px
Combined window H:    680px (panel height dominates)
Snap margin:          80px from left/right edges
```

---

## Dev Commands
```bash
npm run build        # full build
.\launch.bat         # launch (uses cache if build exists)
npx electron .       # launch without rebuild
```

---

## Open Questions for Next Session
1. Should the bubble size be configurable (affects OS window size)? Currently stored in `settings.bubbleSize` (default 56).
2. When dragging while panel is open — should the panel drag too (as one unit)? YES — the whole OS window moves.
3. Snap-to-edge: should it snap to both left/right edges only, or also top/bottom?
4. Is there a secondary monitor? If yes, need to handle multi-display positioning.
