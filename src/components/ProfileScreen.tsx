import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { useTranslation } from '../translations';
import confetti from 'canvas-confetti';

interface ProfileScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpen2FA: () => void;
  onOpenSupport: () => void;
  onOpenBroadcast: () => void;
  onAppleSignIn: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  onOpen2FA,
  onOpenSupport,
  onOpenBroadcast,
  onAppleSignIn,
}) => {
  const { t } = useTranslation(profile.language);
  const isDark = profile.theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateProfile({
            ...profile,
            avatarUrl: reader.result,
          });
          setSavedFeedback('Аватар обновлен!');
          setTimeout(() => setSavedFeedback(null), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    setSavedFeedback('Настройки успешно сохранены!');
    confetti({
      particleCount: 20,
      spread: 35,
      origin: { y: 0.8 },
      colors: ['#00f1fd', '#7928ca'],
    });
    setTimeout(() => setSavedFeedback(null), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full max-w-lg mx-auto px-4 pb-28 pt-2 space-y-4"
    >
      {/* Feedback Toast */}
      {savedFeedback && (
        <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {savedFeedback}
          </span>
        </div>
      )}

      {/* Profile Header Hero Card */}
      <section
        className={`relative overflow-hidden rounded-2xl p-5 shadow-xl transition-all border ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-zinc-200 shadow-sm'
        }`}
      >
        <div className="relative z-10 flex flex-col space-y-4">
          {/* Avatar & Identifiers */}
          <div className="flex items-center gap-4">
            {/* Clickable Avatar with File Picker */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-600 shadow-md group-hover:brightness-90 transition-all"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[14px] font-bold">edit</span>
              </div>
            </div>

            {/* Name, Handle, Pro Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold tracking-wider shadow-sm">
                  {t.proMember}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  {t.bioRhythmsAligned}
                </span>
              </div>

              <h2
                className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl truncate ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}
              >
                {profile.name}
              </h2>
              <p className="text-xs text-zinc-400 font-medium">{profile.handle}</p>
            </div>
          </div>

          {/* Bento Strip of 3 Core Stats */}
          <div
            className={`grid grid-cols-3 gap-2 p-3 rounded-xl border ${
              isDark ? 'bg-zinc-800/80 border-zinc-700/60' : 'bg-zinc-100 border-zinc-200'
            }`}
          >
            <div className="text-center flex flex-col">
              <span
                className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}
              >
                {profile.focusDaysStreak}
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">{t.streakDaysUnit}</span>
            </div>
            <div className="text-center flex flex-col border-x border-zinc-700/50">
              <span
                className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}
              >
                {(profile.totalCaloriesBurned / 1000).toFixed(1)}k
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">{t.kcalBurnedMonth}</span>
            </div>
            <div className="text-center flex flex-col">
              <span
                className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                {profile.completionRate}%
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">{t.completionRateLabel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Master AI Toggle: Умные био-ритмы */}
      <section
        className={`p-4 rounded-xl shadow-sm flex items-center justify-between transition-all border ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-zinc-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <span className="material-symbols-outlined text-[22px]">psychology</span>
          </div>
          <div>
            <h4
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              {t.smartBioRhythms}
            </h4>
            <p className="text-xs text-zinc-400">{t.adaptiveAiTiming}</p>
          </div>
        </div>

        {/* Switch */}
        <button
          type="button"
          onClick={() =>
            onUpdateProfile({
              ...profile,
              bioRhythmSyncActive: !profile.bioRhythmSyncActive,
            })
          }
          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
            profile.bioRhythmSyncActive ? 'bg-blue-600' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 left-0.5 ${
              profile.bioRhythmSyncActive ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </section>

      {/* Notification Channels Matrix (4 Active Channels) */}
      <section
        className={`p-4 rounded-xl shadow-sm space-y-3.5 border ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-zinc-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <h4
            className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            {t.notificationChannels}
          </h4>
          <span className="text-xs font-semibold text-blue-400">{t.channelsActive}</span>
        </div>

        <div className="space-y-3">
          {/* Channel 1: Workouts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400 text-[20px]">
                fitness_center
              </span>
              <div>
                <p className={`text-xs font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                  {t.channelWorkouts}
                </p>
                <p className="text-[11px] text-zinc-400">{t.channelWorkoutsDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.notifications.workouts}
              onChange={e =>
                onUpdateProfile({
                  ...profile,
                  notifications: { ...profile.notifications, workouts: e.target.checked },
                })
              }
              className="accent-blue-600 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Channel 2: Bio Sync */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400 text-[20px]">sync</span>
              <div>
                <p className={`text-xs font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                  {t.channelBioSync}
                </p>
                <p className="text-[11px] text-zinc-400">{t.channelBioSyncDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.notifications.bioSync}
              onChange={e =>
                onUpdateProfile({
                  ...profile,
                  notifications: { ...profile.notifications, bioSync: e.target.checked },
                })
              }
              className="accent-blue-600 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Channel 3: Deadlines */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-400 text-[20px]">
                hourglass_bottom
              </span>
              <div>
                <p className={`text-xs font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                  {t.channelDeadlines}
                </p>
                <p className="text-[11px] text-zinc-400">{t.channelDeadlinesDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.notifications.deadlines}
              onChange={e =>
                onUpdateProfile({
                  ...profile,
                  notifications: { ...profile.notifications, deadlines: e.target.checked },
                })
              }
              className="accent-blue-600 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Channel 4: Hydration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sky-400 text-[20px]">
                water_drop
              </span>
              <div>
                <p className={`text-xs font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                  {t.channelHydration}
                </p>
                <p className="text-[11px] text-zinc-400">{t.channelHydrationDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.notifications.hydration}
              onChange={e =>
                onUpdateProfile({
                  ...profile,
                  notifications: { ...profile.notifications, hydration: e.target.checked },
                })
              }
              className="accent-blue-600 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Quiet Hours Card: 22:30 - 07:30 */}
      <section
        className={`p-4 rounded-xl shadow-sm flex items-center justify-between border ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-zinc-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-blue-400 flex items-center justify-center shrink-0 border border-zinc-700">
            <span className="material-symbols-outlined text-[20px]">bedtime</span>
          </div>
          <div>
            <h4
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              {t.quietSleepHour}
            </h4>
            <p className="text-xs text-zinc-400">
              {profile.quietHours.start} – {profile.quietHours.end} ({profile.quietHours.durationLabel})
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-md text-xs font-semibold text-blue-400 bg-blue-950/40 border border-blue-800/40">
          {t.sleepProtected}
        </span>
      </section>

      {/* Delivery Style Switcher (Мягкий / Haptic / Баннер) */}
      <section
        className={`p-4 rounded-xl shadow-sm space-y-3 border ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-zinc-200'
        }`}
      >
        <h4
          className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm ${
            isDark ? 'text-zinc-100' : 'text-zinc-900'
          }`}
        >
          {t.deliveryStyle}
        </h4>

        <div
          className={`flex p-1 rounded-xl border ${
            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
          }`}
        >
          <button
            onClick={() => onUpdateProfile({ ...profile, deliveryStyle: 'soft' })}
            className={`flex-1 py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
              profile.deliveryStyle === 'soft'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {t.styleSoft}
          </button>
          <button
            onClick={() => onUpdateProfile({ ...profile, deliveryStyle: 'haptic' })}
            className={`flex-1 py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
              profile.deliveryStyle === 'haptic'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {t.styleHaptic}
          </button>
          <button
            onClick={() => onUpdateProfile({ ...profile, deliveryStyle: 'banner' })}
            className={`flex-1 py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
              profile.deliveryStyle === 'banner'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {t.styleBanner}
          </button>
        </div>
      </section>

      {/* Theme Choice Cards: Dark Aurora vs Pearlescent */}
      <section
        className={`p-4 rounded-xl shadow-sm space-y-3 border ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-zinc-200'
        }`}
      >
        <h4
          className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm ${
            isDark ? 'text-zinc-100' : 'text-zinc-900'
          }`}
        >
          {t.auraThemeDesign}
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Dark Aurora Card */}
          <div
            onClick={() => onUpdateProfile({ ...profile, theme: 'dark' })}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              profile.theme === 'dark'
                ? 'bg-zinc-800 border-blue-500 shadow-sm'
                : 'bg-zinc-900/60 border-zinc-800 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-700 shadow-sm" />
              {profile.theme === 'dark' && (
                <span className="material-symbols-outlined text-[18px] text-blue-400">
                  check_circle
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-zinc-100">{t.darkAurora}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{t.activeNow}</p>
          </div>

          {/* Pearlescent Card */}
          <div
            onClick={() => onUpdateProfile({ ...profile, theme: 'light' })}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              profile.theme === 'light'
                ? 'bg-zinc-100 border-blue-500 shadow-sm'
                : 'bg-zinc-100/60 border-zinc-300 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-5 h-5 rounded-full bg-white border border-zinc-300 shadow-sm" />
              {profile.theme === 'light' && (
                <span className="material-symbols-outlined text-[18px] text-blue-600">
                  check_circle
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-zinc-900">{t.pearlescent}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{t.dayMode}</p>
          </div>
        </div>
      </section>

      {/* Integrations & Devices (Apple Health & Apple Watch) */}
      <section
        className={`p-4 rounded-xl shadow-sm space-y-3 border ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-zinc-200'
        }`}
      >
        <h4
          className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm ${
            isDark ? 'text-zinc-100' : 'text-zinc-900'
          }`}
        >
          {t.integrationsDevices}
        </h4>

        <div className="space-y-2.5">
          {/* Apple Health */}
          <div
            className={`p-3 rounded-xl flex items-center justify-between border ${
              isDark ? 'bg-zinc-800/70 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </div>
              <div>
                <p className={`text-xs font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                  {t.appleHealth}
                </p>
                <p className="text-[10px] text-zinc-400">{t.syncedMinutesAgo}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
              {t.activeTag}
            </span>
          </div>

          {/* Apple Watch Ultra */}
          <div
            className={`p-3 rounded-xl flex items-center justify-between border ${
              isDark ? 'bg-zinc-800/70 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">watch</span>
              </div>
              <div>
                <p className={`text-xs font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                  {t.appleWatchUltra}
                </p>
                <p className="text-[10px] text-zinc-400">{t.biometricHapticFeedback}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
              {t.activeTag}
            </span>
          </div>
        </div>
      </section>

      {/* Action Tools Grid: 2FA, Support Chat, Broadcast API, Apple ID */}
      <section className="grid grid-cols-2 gap-2.5">
        {/* 2FA Security Button */}
        <button
          onClick={onOpen2FA}
          type="button"
          className={`p-3.5 rounded-xl flex flex-col justify-between text-left shadow-sm transition-all active:scale-95 border ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2 border border-blue-500/30">
            <span className="material-symbols-outlined text-[18px]">security</span>
          </div>
          <div>
            <p className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {t.securityAnd2fa}
            </p>
            <p className="text-[10px] text-zinc-400">{t.securitySub}</p>
          </div>
        </button>

        {/* Support Chat Button */}
        <button
          onClick={onOpenSupport}
          type="button"
          className={`p-3.5 rounded-xl flex flex-col justify-between text-left shadow-sm transition-all active:scale-95 border ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2 border border-blue-500/30">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
          </div>
          <div>
            <p className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {t.supportChat}
            </p>
            <p className="text-[10px] text-zinc-400">{t.supportChatSub}</p>
          </div>
        </button>

        {/* Broadcast API Manager Button */}
        <button
          onClick={onOpenBroadcast}
          type="button"
          className={`p-3.5 rounded-xl flex flex-col justify-between text-left shadow-sm transition-all active:scale-95 border ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center mb-2 border border-amber-500/30">
            <span className="material-symbols-outlined text-[18px]">campaign</span>
          </div>
          <div>
            <p className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {t.broadcastApi}
            </p>
            <p className="text-[10px] text-zinc-400">{t.broadcastSub}</p>
          </div>
        </button>

        {/* Apple ID Auth Flow Button */}
        <button
          onClick={onAppleSignIn}
          type="button"
          className={`p-3.5 rounded-xl flex flex-col justify-between text-left shadow-sm transition-all active:scale-95 border ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-100 flex items-center justify-center mb-2 border border-zinc-700">
            <span className="material-symbols-outlined text-[18px]">apple</span>
          </div>
          <div>
            <p className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              Apple ID
            </p>
            <p className="text-[10px] text-zinc-400">Связан с iCloud</p>
          </div>
        </button>
      </section>

      {/* Save Settings Primary Button */}
      <button
        type="button"
        onClick={handleSaveSettings}
        className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-900/30 active:scale-98 transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">check</span>
        <span>{t.saveNotificationSettings}</span>
      </button>

      {/* App Build Version & Cloud Sync status footnote */}
      <div className="text-center pt-2 pb-1 text-[11px] text-zinc-500">
        <p>{t.appBuildVersion}</p>
      </div>
    </motion.div>
  );
};
