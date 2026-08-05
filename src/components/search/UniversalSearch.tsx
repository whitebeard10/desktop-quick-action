import React, { useState, useEffect } from 'react';
import { Search, X, Command, FileText, Globe, Terminal, Calculator, VolumeX, Camera, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { actionEngine } from '@core/action-engine';

export const UniversalSearch: React.FC = () => {
  const { searchQuery, setSearchQuery, searchResults, theme } = useAppStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, searchResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % Math.max(1, searchResults.length));
    } else if (e.key === 'Enter') {
      if (searchResults.length > 0 && searchResults[selectedIndex]) {
        actionEngine.execute(searchResults[selectedIndex].action);
      }
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'app': return <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">APP</span>;
      case 'file': return <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">FILE</span>;
      case 'command': return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">CMD</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] bg-slate-500/20 text-slate-300">LINK</span>;
    }
  };

  return (
    <div className="flex flex-col gap-3 p-1">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search apps, files, commands, URLs..."
          autoFocus
          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Suggestion Chips */}
      {!searchQuery && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-400">
          <span className="text-[11px] font-semibold text-slate-500">Quick Actions:</span>
          {[
            { label: 'Calculator', query: 'Calculator' },
            { label: 'PowerShell', query: 'PowerShell' },
            { label: 'Toggle Mute', query: 'Mute' },
            { label: 'Screenshot', query: 'Screenshot' },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => setSearchQuery(chip.query)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] border border-white/5 transition-all"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
        {searchResults.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            {searchQuery ? 'No matching apps or files found' : 'Type to search across Windows desktop'}
          </div>
        ) : (
          searchResults.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={item.id}
                onClick={() => actionEngine.execute(item.action)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/30 border-blue-500/50 shadow-md'
                    : 'bg-white/5 hover:bg-white/10 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-white/10 text-slate-200">
                    <Command className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getCategoryBadge(item.category)}
                  <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
