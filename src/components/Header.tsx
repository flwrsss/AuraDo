import React from 'react';
import { UserProfile, MainTab } from '../types';
import { useTranslation } from '../translations';

interface HeaderProps {
  profile: UserProfile;
  activeTab: MainTab;
  isOnline: boolean;
  onProfileClick: () => void;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  isOnline,
  onProfileClick,
  onToggleTheme,
  onToggleLanguage,
}) => {
  const { t } = useTranslation(profile.language);
  const isDark = profile.theme === 'dark';

  const tabLabels: Record<MainTab, string> = {
    tasks: isDark ? 'TODAY' : 'TASKS',
    workouts: 'WORKOUTS',
    analytics: isDark ? 'STATS' : 'ANALYTICS',
    profile: 'PROFILE',
  };

  return (
    <header
      id="app-header"
      className={`fixed top-0 left-0 right-0 z-50 pt-safe transition-colors duration-300 ${
        isDark
          ? 'bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800'
          : 'bg-white/90 backdrop-blur-md border-b border-zinc-200'
      }`}
    >
      <div className="h-14 sm:h-16 px-4 max-w-lg mx-auto flex items-center justify-between">
        {/* Left: Brand Logo & Screen Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onProfileClick()}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/30 text-sm">
              A
            </div>
            <span
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base tracking-tight ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              {t.appName} <span className="text-blue-500 text-xs font-semibold">PRO</span>
            </span>
          </div>

          <span
            className={`font-['Inter',sans-serif] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              isDark
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
            }`}
          >
            {tabLabels[activeTab]}
          </span>
        </div>

        {/* Right: Quick actions & Profile Avatar */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Status Pill */}
          <div
            title={isOnline ? t.onlineBadge : t.offlineBadge}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              isOnline
                ? isDark
                  ? 'bg-zinc-900 text-emerald-400 border border-zinc-800'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden xs:inline">{isOnline ? 'Real-time Live' : 'Offline'}</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            id="lang-toggle-btn"
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
            }`}
            title="Toggle Language (RU / EN)"
          >
            {profile.language.toUpperCase()}
          </button>

          {/* Theme Quick Toggle */}
          <button
            onClick={onToggleTheme}
            id="theme-toggle-btn"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-zinc-700'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
            }`}
            title="Toggle Theme"
          >
            <span className="material-symbols-outlined text-[17px]">
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          {/* Profile Avatar Button */}
          <button
            id="header-profile-btn"
            onClick={onProfileClick}
            className="relative min-w-[34px] min-h-[34px] flex items-center justify-center rounded-full transition-transform active:scale-95 group"
            title={profile.name}
          >
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-700 group-hover:ring-blue-500 transition-all"
            />
            {profile.isPro && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold shadow-sm">
                ✓
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
