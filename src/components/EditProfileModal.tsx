import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ThemeMode } from '../types';
import confetti from 'canvas-confetti';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  theme: ThemeMode;
  onSaveProfile: (updated: UserProfile) => void;
  onResetAllData: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  theme,
  onSaveProfile,
  onResetAllData,
}) => {
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle.replace(/^@/, ''));
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [weightKg, setWeightKg] = useState(profile.weightKg || 70);
  const [heightCm, setHeightCm] = useState(profile.heightCm || 175);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(profile.dailyCalorieTarget || 600);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedHandle = handle.trim().startsWith('@')
      ? handle.trim()
      : `@${handle.trim() || 'user'}`;

    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Пользователь',
      handle: formattedHandle,
      bio: bio.trim(),
      avatarUrl,
      weightKg: Number(weightKg) || 70,
      heightCm: Number(heightCm) || 175,
      dailyCalorieTarget: Number(dailyCalorieTarget) || 600,
    };

    onSaveProfile(updated);
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#3b82f6', '#10b981', '#f59e0b'],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 border ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/40 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </div>
              <div>
                <h3 className="font-bold text-base font-['Plus_Jakarta_Sans',sans-serif]">
                  Редактировать профиль
                </h3>
                <p className="text-xs text-zinc-400">Измените никнейм, имя и параметры</p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3 pb-2">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-600 shadow-md group-hover:brightness-90 transition-all"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <span className="material-symbols-outlined text-[22px]">photo_camera</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-[11px] text-zinc-400">Нажмите на аватар для загрузки своего фото</span>

              {/* Preset Avatars Bar */}
              <div className="flex items-center gap-2 pt-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform active:scale-90 ${
                      avatarUrl === url ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Никнейм (Handle) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Никнейм в приложении
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-zinc-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={e => setHandle(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))}
                  placeholder="ваш_ник"
                  className={`w-full h-11 pl-8 pr-4 rounded-xl border text-sm font-semibold outline-none transition-colors ${
                    isDark
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 focus:border-blue-500'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-blue-500'
                  }`}
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">Отображается в профиле, аналитике и уведомлениях</p>
            </div>

            {/* Имя (Display Name) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Отображаемое имя
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ваше имя"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-semibold outline-none transition-colors ${
                  isDark
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 focus:border-blue-500'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Статус / Био */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Мотивация / Статус
              </label>
              <input
                type="text"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Например: Дисциплина каждый день"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition-colors ${
                  isDark
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 focus:border-blue-500'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Физические параметры (Вес, Рост, Калории) */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Вес (кг)
                </label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  value={weightKg}
                  onChange={e => setWeightKg(Number(e.target.value))}
                  className={`w-full h-10 px-2.5 rounded-xl border text-xs font-semibold outline-none text-center ${
                    isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Рост (см)
                </label>
                <input
                  type="number"
                  min="100"
                  max="230"
                  value={heightCm}
                  onChange={e => setHeightCm(Number(e.target.value))}
                  className={`w-full h-10 px-2.5 rounded-xl border text-xs font-semibold outline-none text-center ${
                    isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Цель (ккал)
                </label>
                <input
                  type="number"
                  min="200"
                  max="5000"
                  step="50"
                  value={dailyCalorieTarget}
                  onChange={e => setDailyCalorieTarget(Number(e.target.value))}
                  className={`w-full h-10 px-2.5 rounded-xl border text-xs font-semibold outline-none text-center ${
                    isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-300'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 active:scale-98 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>Сохранить профиль</span>
              </button>
            </div>

            {/* Clear All Data / Reset Button */}
            <div className="pt-2 border-t border-zinc-800/40">
              {!showConfirmReset ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="w-full py-2 text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Сбросить данные к чистому приложению</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 space-y-2 text-center">
                  <p className="text-xs text-rose-300 font-medium">
                    Удалить все сохраненные задачи, тренировки и начать с 0?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(false)}
                      className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onResetAllData();
                        setShowConfirmReset(false);
                        onClose();
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
                    >
                      Да, очистить всё
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
