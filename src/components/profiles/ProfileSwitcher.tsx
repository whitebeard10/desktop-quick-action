import React from 'react';
import { Briefcase, Gamepad2, GraduationCap, Palette, Check, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const ProfileSwitcher: React.FC = () => {
  const { profiles, activeProfile, setActiveProfile } = useAppStore();

  const getProfileIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'Palette': return <Palette className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="text-xs text-slate-400 font-medium">
        Select a active desktop profile to instantly switch pinned apps, widget layouts, and accent themes:
      </div>

      <div className="grid grid-cols-2 gap-3">
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfile.id;
          return (
            <div
              key={profile.id}
              onClick={() => setActiveProfile(profile.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                isActive
                  ? 'bg-white/10 border-blue-500 shadow-xl'
                  : 'bg-white/5 hover:bg-white/10 border-white/10'
              }`}
              style={{
                borderColor: isActive ? profile.accentColor : undefined,
              }}
            >
              {isActive && (
                <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-white">
                  <Check className="w-3 h-3" />
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <div
                  className="p-2 rounded-lg text-white"
                  style={{ backgroundColor: `${profile.accentColor}33`, color: profile.accentColor }}
                >
                  {getProfileIcon(profile.icon)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{profile.name}</div>
                  <div className="text-[10px] text-slate-400">{profile.activeWidgets.length} Active Widgets</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                {profile.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
