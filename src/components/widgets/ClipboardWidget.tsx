import React, { useState } from 'react';
import { Clipboard, Pin, Copy, Trash2, Check } from 'lucide-react';
import { clipboardService, ClipboardItem } from '@core/service-layer/ClipboardService';
import { useAppStore } from '@/store/useAppStore';

export const ClipboardWidget: React.FC = () => {
  const [history, setHistory] = useState<ClipboardItem[]>(clipboardService.getHistory());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { theme } = useAppStore();

  const handleCopy = async (item: ClipboardItem) => {
    await clipboardService.copyToClipboard(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleTogglePin = (id: string) => {
    clipboardService.togglePin(id);
    setHistory([...clipboardService.getHistory()]);
  };

  const handleClear = () => {
    clipboardService.clearHistory();
    setHistory([...clipboardService.getHistory()]);
  };

  return (
    <div className="p-4 rounded-xl acrylic-card border border-white/10 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Clipboard className="w-4 h-4" style={{ color: theme.accentColor }} />
          <span>Clipboard History ({history.length})</span>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            title="Clear unpinned clips"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate-500">No clips in history</div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {history.map((clip) => (
            <div
              key={clip.id}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between gap-2 group transition-all"
            >
              <span className="text-xs text-slate-200 truncate flex-1 font-mono">{clip.text}</span>
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                <button
                  onClick={() => handleTogglePin(clip.id)}
                  className={`p-1 rounded hover:bg-white/10 ${clip.pinned ? 'text-amber-400' : 'text-slate-400'}`}
                  title={clip.pinned ? 'Unpin' : 'Pin'}
                >
                  <Pin className="w-3 h-3 fill-current" />
                </button>
                <button
                  onClick={() => handleCopy(clip)}
                  className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                  title="Copy clip"
                >
                  {copiedId === clip.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
