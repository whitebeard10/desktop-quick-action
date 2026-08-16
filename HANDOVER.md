# Desktop QuickAction — Handover Document
**Date:** 2026-08-12  
**Branch:** `main` — latest commit `10db546`

---

## What This App Is

A Windows desktop overlay app (Electron + React + Vite) that shows a small floating bubble anywhere on screen. Clicking the bubble opens an "Action Panel" with app launchers, widgets, search, profiles, themes, and settings. The bubble is always-on-top and draggable.

---

## Current State of the Codebase

## Current Architecture & Resolution

### Exact-Fit OS Window + Pointer Drag Architecture (IMPLEMENTED)

1. **Exact-Fit BrowserWindow**:
   - Initial window size is exactly 56x56 (`bubbleSize`).
   - 0% of desktop is covered or blocked when panel is closed.
   - When panel opens, window resizes to 524x680 (`bubbleSize + GAP + PANEL_W`, `PANEL_H`) and repositions dynamically to keep everything on-screen.

2. **Pointer Drag & Click Handling**:
   - Replaced unreliable `WebkitAppRegion: 'drag'` (which intercepted Win32 NCHITTEST and broke React click/hover events on Windows) with pointer capture screen-coordinate tracking.
   - Pointer down records initial screen coordinates (`e.screenX`, `e.screenY`) and OS window position.
   - Pointer move updates window position in real-time using high-speed 1-way IPC (`window:move`).
   - Drag distance threshold (< 4px) distinguishes between a click (opens/closes Action Panel) and a drag (moves window across screen + snaps to edge).
   - ActionPanel header bar also supports pointer drag to move the panel when open.

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
