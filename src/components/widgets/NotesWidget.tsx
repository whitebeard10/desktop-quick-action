import React, { useState, useEffect } from 'react';
import { FileText, Save, Check } from 'lucide-react';
import { repository } from '@core/repository';
import { useAppStore } from '@/store/useAppStore';

export const NotesWidget: React.FC = () => {
  const { activeProfile, theme } = useAppStore();
  const storageKey = `notes_${activeProfile.id}`;

  // Load from storage once on mount; empty string is the default (no fake placeholder)
  const [note, setNote] = useState<string>(() =>
    repository.getItem<string>(storageKey, '')
  );
  const [isSaved, setIsSaved] = useState(false);

  // When the active profile changes, reload the note for that profile
  useEffect(() => {
    setNote(repository.getItem<string>(`notes_${activeProfile.id}`, ''));
  }, [activeProfile.id]);


  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);
    repository.setItem(storageKey, val);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1200);
  };

  return (
    <div className="p-4 rounded-xl acrylic-card border border-white/10 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <FileText className="w-4 h-4" style={{ color: theme.accentColor }} />
          <span>Quick Scratchpad ({activeProfile.name})</span>
        </div>
        {isSaved && (
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> Saved
          </span>
        )}
      </div>

      <textarea
        value={note}
        onChange={handleChange}
        placeholder="Type quick notes here..."
        className="w-full h-28 bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none font-mono leading-relaxed"
      />
    </div>
  );
};
