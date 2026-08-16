import React, { useState } from 'react';
import { 
  Plus, 
  Code2, 
  Globe, 
  Terminal, 
  FileSpreadsheet, 
  Gamepad2, 
  MessageSquare, 
  Music, 
  Music2,
  Calculator,
  Palette, 
  Pin, 
  Trash2, 
  ExternalLink,
  FolderPlus
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { AppItem, CategoryType } from '@/types';

export const AppLauncher: React.FC = () => {
  const { apps, activeProfile, launchApp, addApp, togglePinApp, deleteApp, theme } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for Add App modal
  const [title, setTitle] = useState('');
  const [pathOrUrl, setPathOrUrl] = useState('');
  const [type, setType] = useState<'exe' | 'url' | 'folder' | 'script'>('exe');
  const [category, setCategory] = useState<CategoryType>('Work');

  const categories: CategoryType[] = ['All', 'Work', 'Development', 'Media', 'Gaming', 'Utilities'];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2': return <Code2 className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'Terminal': return <Terminal className="w-5 h-5" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-5 h-5" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5" />;
      case 'Music': return <Music className="w-5 h-5" />;
      case 'Music2': return <Music2 className="w-5 h-5" />;
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      case 'Palette': return <Palette className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const filteredApps = apps.filter((app) => {
    if (selectedCategory !== 'All' && app.category !== selectedCategory) return false;
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !pathOrUrl) return;

    addApp({
      title,
      icon: type === 'url' ? 'Globe' : 'Code2',
      pathOrUrl,
      type,
      category,
      isPinned: true,
      profileId: activeProfile.id,
    });

    setTitle('');
    setPathOrUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Category Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-md shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add App
        </button>
      </div>

      {/* Grid Launcher */}
      <div className="grid grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="group relative p-3 rounded-xl acrylic-card border border-white/10 hover:border-white/20 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-lg"
            onClick={() => launchApp(app)}
          >
            {/* Quick Pin Indicator */}
            {app.isPinned && (
              <Pin className="absolute top-1.5 right-1.5 w-3 h-3 text-amber-400 fill-current" />
            )}

            <div
              className="p-2.5 rounded-xl bg-white/10 group-hover:bg-white/20 text-white transition-colors"
              style={{ color: theme.accentColor }}
            >
              {getIcon(app.icon)}
            </div>

            <div className="w-full truncate text-xs font-semibold text-slate-200 group-hover:text-white">
              {app.title}
            </div>

            <div className="text-[10px] text-slate-400 group-hover:text-slate-300">
              {app.category}
            </div>

            {/* Hover Actions Menu */}
            <div className="absolute inset-0 rounded-xl bg-slate-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                onClick={(e) => { e.stopPropagation(); togglePinApp(app.id); }}
                className={`p-1.5 rounded-lg bg-white/10 hover:bg-white/20 ${app.isPinned ? 'text-amber-400' : 'text-slate-300'}`}
                title={app.isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteApp(app.id); }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-rose-400"
                title="Remove App"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add App Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-5 rounded-2xl acrylic-card border border-white/20 shadow-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-emerald-400" /> Add Application or Shortcut
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Figma Desktop"
                  required
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Executable Path or URL</label>
                <input
                  type="text"
                  value={pathOrUrl}
                  onChange={(e) => setPathOrUrl(e.target.value)}
                  placeholder="e.g. C:\Program Files\... or https://..."
                  required
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-white/10 text-white"
                  >
                    <option value="exe">EXE / Application</option>
                    <option value="url">Website URL</option>
                    <option value="folder">Folder</option>
                    <option value="script">Script</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-white/10 text-white"
                  >
                    {categories.filter(c => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
