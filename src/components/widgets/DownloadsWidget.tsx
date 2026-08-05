import React, { useState } from 'react';
import { Download, FolderOpen, CheckCircle2 } from 'lucide-react';
import { downloadsService, DownloadItem } from '@core/service-layer/DownloadsService';
import { useAppStore } from '@/store/useAppStore';

export const DownloadsWidget: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>(downloadsService.getDownloads());
  const { theme } = useAppStore();

  const handleOpenFolder = (id: string) => {
    downloadsService.openDownloadLocation(id);
  };

  return (
    <div className="p-4 rounded-xl acrylic-card border border-white/10 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Download className="w-4 h-4" style={{ color: theme.accentColor }} />
          <span>Recent Downloads</span>
        </div>
      </div>

      <div className="space-y-2">
        {downloads.map((item) => (
          <div key={item.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-200 truncate max-w-[200px]">{item.filename}</span>
              <button
                onClick={() => handleOpenFolder(item.id)}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                title="Open Folder"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>
            </div>

            {item.status === 'downloading' ? (
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.progressPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{item.progressPct}% ({item.sizeMb} MB)</span>
                  <span>{item.speedMbps} MB/s</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Downloaded ({item.sizeMb} MB)</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
