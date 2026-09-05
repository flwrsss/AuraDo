import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, WorkoutType, Intensity } from '../types';
import { useTranslation } from '../translations';
import confetti from 'canvas-confetti';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onCreateWorkoutOrTask: (data: {
    type: 'workout' | 'reminder';
    workoutType: WorkoutType;
    duration: number;
    intensity: Intensity;
    calories: number;
    title: string;
    checklist: string[];
    notifyBefore: boolean;
  }) => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  profile,
  onCreateWorkoutOrTask,
}) => {
  const { t } = useTranslation(profile.language);
  const isDark = profile.theme === 'dark';

  const [activeTab, setActiveTab] = useState<'reminder' | 'workout'>('workout');
  const [workoutType, setWorkoutType] = useState<WorkoutType>('strength');
  const [duration, setDuration] = useState(45);
  const [intensity, setIntensity] = useState<Intensity>('high');
  const [notifyBefore, setNotifyBefore] = useState(true);
  const [checklist, setChecklist] = useState<string[]>([
    'Электролиты и 0.75л воды за 30 мин',
    'Разминка ротаторов и связок плеч (5 мин)',
  ]);
  const [notes, setNotes] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [showItemInput, setShowItemInput] = useState(false);

  // Dynamic calorie formula
  const intensityFactor = intensity === 'light' ? 6 : intensity === 'medium' ? 8 : 10.5;
  const estimatedCalories = Math.round(duration * intensityFactor);

  const pulseZoneMap: Record<WorkoutType, { range: string; label: string }> = {
    strength: { range: '135 – 158 уд/мин', label: 'Анаэробный' },
    cardio: { range: '145 – 168 уд/мин', label: 'Аэробный' },
    hiit: { range: '155 – 178 уд/мин', label: 'Максимальный' },
    yoga: { range: '95 – 115 уд/мин', label: 'Восстановление' },
    swim: { range: '130 – 155 уд/мин', label: 'Аэробный' },
  };

  const handleAddChecklistItem = () => {
    if (newItemText.trim()) {
      setChecklist([...checklist, newItemText.trim()]);
      setNewItemText('');
      setShowItemInput(false);
    }
  };

  const handleSave = () => {
    onCreateWorkoutOrTask({
      type: activeTab,
      workoutType,
      duration,
      intensity,
      calories: estimatedCalories,
      title:
        workoutType === 'strength'
          ? 'Силовая сессия'
          : workoutType === 'cardio'
          ? 'Кардио тренировка'
          : workoutType === 'hiit'
          ? 'HIIT интервалы'
          : workoutType === 'yoga'
          ? 'Йога и растяжка'
          : 'Плавание в бассейне',
      checklist,
      notifyBefore,
    });

    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#00f1fd', '#7928ca'],
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl transition-colors border ${
              isDark
                ? 'bg-zinc-900 text-zinc-100 border-zinc-800'
                : 'bg-white text-zinc-900 border-zinc-200'
            }`}
          >
            {/* Top Drag Handle */}
            <div className="w-12 h-1 rounded-full bg-zinc-700/60 mx-auto mb-3" />

            {/* Top Bar: Title & Cancel */}
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  {t.bioRhythmAndTasks}
                </span>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl leading-tight">
                  {t.newEntry}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isDark ? 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                {t.cancel}
              </button>
            </div>

            <div className="space-y-4 pt-3">
              {/* Tab Switcher: Напоминание / Тренировка */}
              <div
                className={`flex p-1 rounded-xl border ${
                  isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('reminder')}
                  className={`flex-1 py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'reminder'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {t.tabReminder}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('workout')}
                  className={`flex-1 py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'workout'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {t.tabWorkout}
                </button>
              </div>

              {/* BioSync Active Indicator */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs">
                <span className="flex items-center gap-1.5 text-blue-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  {t.bioSyncActiveNow}
                </span>
                <span className="text-[10px] text-zinc-400">18:00 – 19:30</span>
              </div>

              {/* Training Type Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t.loadType}</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['strength', 'cardio', 'hiit', 'yoga', 'swim'] as WorkoutType[]).map(type => {
                    const labels: Record<WorkoutType, string> = {
                      strength: t.typeStrength,
                      cardio: t.typeCardio,
                      hiit: t.typeHiit,
                      yoga: t.typeYoga,
                      swim: t.typeSwim,
                    };
                    const isSelected = workoutType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setWorkoutType(type)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : isDark
                            ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:bg-zinc-800'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        {labels[type]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Smart Calculator Duration Slider */}
              <div
                className={`p-4 rounded-xl space-y-2.5 border ${
                  isDark ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-zinc-100 border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                      {t.smartCalc}
                    </span>
                    <h4 className="text-xs font-semibold">{t.adaptiveExpense}</h4>
                  </div>

                  <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-bold shadow-sm">
                    ~{estimatedCalories} ккал
                  </span>
                </div>

                {/* Slider */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs font-medium text-zinc-400">
                    <span>{t.durationLabel}</span>
                    <span className="text-blue-400 font-bold">{duration} мин</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={120}
                    step={5}
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>15 мин</span>
                    <span>45 мин</span>
                    <span>90 мин</span>
                    <span>120 мин</span>
                  </div>
                </div>
              </div>

              {/* Session Intensity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t.intensityLabel}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'medium', 'high'] as Intensity[]).map(lvl => {
                    const labels: Record<Intensity, string> = {
                      light: t.intensityLight,
                      medium: t.intensityMedium,
                      high: t.intensityHigh,
                    };
                    const isSelected = intensity === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setIntensity(lvl)}
                        className={`py-2 text-center rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : isDark
                            ? 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {labels[lvl]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optimal Pulse Zone */}
              <div
                className={`p-3 rounded-xl flex items-center justify-between border ${
                  isDark ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-zinc-100 border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">favorite</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{t.optimalPulseZone}</p>
                    <p className="text-[11px] text-zinc-400">
                      {pulseZoneMap[workoutType].range}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
                  {pulseZoneMap[workoutType].label}
                </span>
              </div>

              {/* Reminder Switch */}
              <div className="flex items-center justify-between p-2">
                <div>
                  <p className="text-xs font-semibold">{t.reminderStart}</p>
                  <p className="text-[11px] text-zinc-400">{t.notify15MinBefore}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyBefore}
                  onChange={e => setNotifyBefore(e.target.checked)}
                  className="accent-blue-600 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Notes and Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">
                    {t.notesAndChecklist}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowItemInput(!showItemInput)}
                    className="text-xs text-blue-400 font-bold hover:underline"
                  >
                    + {t.itemBtn}
                  </button>
                </div>

                {showItemInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItemText}
                      onChange={e => setNewItemText(e.target.value)}
                      placeholder="Новый пункт чек-листа..."
                      className={`flex-1 px-3 py-1.5 rounded-xl text-xs border ${
                        isDark ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-100 text-zinc-900 border-zinc-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                    >
                      Ок
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  {checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                        isDark ? 'bg-zinc-800/80 border-zinc-750' : 'bg-zinc-100 border-zinc-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px] text-blue-400">
                        check_circle
                      </span>
                      <span className="flex-1 truncate">{item}</span>
                    </div>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className={`w-full p-3 rounded-xl text-xs focus:outline-none border ${
                    isDark
                      ? 'bg-zinc-800 text-white placeholder:text-zinc-500 border-zinc-700'
                      : 'bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 border-zinc-200'
                  }`}
                />
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleSave}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-900/30 active:scale-98 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>{t.saveAndActivate}</span>
              </button>

              <p className="text-[10px] text-center text-zinc-500">{t.cloudSyncFootnote}</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
