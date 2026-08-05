import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { mediaService, MediaState } from '@core/service-layer/MediaService';
import { useAppStore } from '@/store/useAppStore';

export const MusicWidget: React.FC = () => {
  const [media, setMedia] = useState<MediaState>(mediaService.getMediaState());
  const { theme } = useAppStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setMedia({ ...mediaService.getMediaState() });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 rounded-xl acrylic-card border border-white/10 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Music className="w-4 h-4 text-emerald-400" />
          <span>Media Player</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          Spotify
        </span>
      </div>

      <div className="flex items-center gap-3">
        <img
          src={media.coverUrl}
          alt={media.title}
          className="w-12 h-12 rounded-lg object-cover shadow-md border border-white/10"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white truncate">{media.title}</div>
          <div className="text-[11px] text-slate-400 truncate">{media.artist} — {media.album}</div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              mediaService.togglePlayPause();
              setMedia({ ...mediaService.getMediaState() });
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shadow"
          >
            {media.isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <button
            onClick={() => {
              mediaService.nextTrack();
              setMedia({ ...mediaService.getMediaState() });
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Track Seek Progress Bar */}
      <div className="space-y-1">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${(media.progressSec / media.durationSec) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>{formatTime(media.progressSec)}</span>
          <span>{formatTime(media.durationSec)}</span>
        </div>
      </div>
    </div>
  );
};
