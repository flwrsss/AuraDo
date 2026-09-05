import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkoutPreset, WorkoutSession, ExerciseItem } from '../types';
import { StorageService } from '../services/storage';

interface PresetWorkoutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (workout: WorkoutSession) => void;
  isDark: boolean;
}

export const PresetWorkoutsModal: React.FC<PresetWorkoutsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  isDark,
}) => {
  const presets: WorkoutPreset[] = StorageService.getPresets();
  const [activeCategory, setActiveCategory] = useState<'all' | 'strength' | 'hiit' | 'recovery'>('all');

  const filteredPresets = presets.filter(p => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'strength') return p.type === 'Силовая';
    if (activeCategory === 'hiit') return p.type === 'HIIT';
    if (activeCategory === 'recovery') return p.type === 'Йога & Кор' || p.type === 'Растяжка';
    return true;
  });

  const handleApplyPreset = (preset: WorkoutPreset) => {
    const exercises: ExerciseItem[] = preset.exercises.map((e, idx) => ({
      id: 'ex-preset-' + Date.now() + '-' + idx,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      completedSets: 0,
      calories: e.calories,
      active: idx === 0,
      weightKg: e.weightKg,
    }));

    const session: WorkoutSession = {
      id: 'workout-' + preset.id + '-' + Date.now(),
      title: preset.title,
      muscleGroup: preset.muscleGroup,
      type: preset.type,
      caloriesEstimate: preset.caloriesEstimate,
      durationMinutes: preset.durationMinutes,
      exerciseCount: exercises.length,
      exercises,
      image: preset.image,
      isPinned: true,
      status: 'planned',
      createdAt: new Date().toISOString(),
    };

    onSelectPreset(session);
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`relative w-full max-w-lg rounded-3xl p-6 shadow-2xl border max-h-[90vh] flex flex-col z-10 ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <span className="material-symbols-outlined text-[20px]">library_add_check</span>
              </div>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg leading-tight">
                  Готовые тренировки
                </h3>
                <p className="text-xs text-zinc-400">Выберите научно рассчитанную программу на сегодня</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Categories Bar */}
          <div className="flex items-center gap-1.5 py-3 overflow-x-auto shrink-0 scrollbar-none">
            {[
              { id: 'all', label: 'Все программы' },
              { id: 'strength', label: 'Силовые' },
              { id: 'hiit', label: 'HIIT & Кардио' },
              { id: 'recovery', label: 'Кор & Йога' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : isDark
                    ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div className="overflow-y-auto space-y-3.5 pr-1 flex-1 py-1">
            {filteredPresets.map(preset => (
              <div
                key={preset.id}
                className={`rounded-2xl p-4 border transition-all hover:border-blue-500/50 flex flex-col space-y-3 ${
                  isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-800">
                    <img
                      src={preset.image}
                      alt={preset.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-blue-950/50 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-800/40">
                        {preset.muscleGroup}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
                        {preset.type}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm truncate">{preset.title}</h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                      {preset.description}
                    </p>
                  </div>
                </div>

                {/* Metrics and Exercise Tags */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/40">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-blue-400">timer</span>
                      {preset.durationMinutes} мин
                    </span>
                    <span className="flex items-center gap-1 text-blue-400 font-semibold">
                      <span className="material-symbols-outlined text-[15px]">local_fire_department</span>
                      ~{preset.caloriesEstimate} ккал
                    </span>
                    <span>{preset.exercises.length} упражнений</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md shadow-blue-900/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Выбрать</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
