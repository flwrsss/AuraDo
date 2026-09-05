import React from 'react';
import { MainTab, ThemeMode, Language } from '../types';
import { useTranslation } from '../translations';

interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onQuickCreate: () => void;
  theme: ThemeMode;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onQuickCreate,
  theme,
  language,
}) => {
  const { t } = useTranslation(language);
  const isDark = theme === 'dark';

  return (
    <nav
      id="bottom-navigation-bar"
      className={`fixed bottom-0 left-0 right-0 z-50 pb-safe transition-colors duration-300 ${
        isDark
          ? 'bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800'
          : 'bg-white/95 backdrop-blur-md border-t border-zinc-200'
      }`}
    >
      <div className="h-16 max-w-lg mx-auto px-4 flex items-center justify-around relative">
        {/* Tab 1: Tasks */}
        <button
          id="nav-tab-tasks"
          onClick={() => onTabChange('tasks')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all active:scale-95 ${
            activeTab === 'tasks'
              ? 'text-blue-500 font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'tasks' ? "'FILL' 1" : "'FILL' 0" }}
          >
            check_circle
          </span>
          <span className="font-['Inter',sans-serif] text-[11px] tracking-tight">{t.tasks}</span>
        </button>

        {/* Tab 2: Workouts */}
        <button
          id="nav-tab-workouts"
          onClick={() => onTabChange('workouts')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all active:scale-95 ${
            activeTab === 'workouts'
              ? 'text-blue-500 font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'workouts' ? "'FILL' 1" : "'FILL' 0" }}
          >
            fitness_center
          </span>
          <span className="font-['Inter',sans-serif] text-[11px] tracking-tight">{t.workouts}</span>
        </button>

        {/* Center Kinetic Floating Quick Create Button */}
        <div className="relative -top-3 flex flex-col items-center justify-center">
          <button
            id="quick-create-btn"
            onClick={onQuickCreate}
            className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-900/40 transition-all active:scale-90 hover:brightness-105 cursor-pointer"
            title={t.quickCreate}
          >
            <span className="material-symbols-outlined text-[26px] font-bold">add</span>
          </button>
        </div>

        {/* Tab 3: Analytics */}
        <button
          id="nav-tab-analytics"
          onClick={() => onTabChange('analytics')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all active:scale-95 ${
            activeTab === 'analytics'
              ? 'text-blue-500 font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'analytics' ? "'FILL' 1" : "'FILL' 0" }}
          >
            bar_chart
          </span>
          <span className="font-['Inter',sans-serif] text-[11px] tracking-tight">{t.analytics}</span>
        </button>

        {/* Tab 4: Profile */}
        <button
          id="nav-tab-profile"
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all active:scale-95 ${
            activeTab === 'profile'
              ? 'text-blue-500 font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
          >
            person
          </span>
          <span className="font-['Inter',sans-serif] text-[11px] tracking-tight">{t.profile}</span>
        </button>
      </div>
    </nav>
  );
};
