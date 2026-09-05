import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { WorkoutSession } from '../types';

interface WorkoutFinishModalProps {
  isOpen: boolean;
  workout: WorkoutSession;
  elapsedSeconds: number;
  calculatedCalories: number;
  onClose: () => void;
  onSaveToHistory: (summary: {
    workout: WorkoutSession;
    caloriesBurned: number;
    durationMinutes: number;
  }) => void;
  isDark: boolean;
}

export const WorkoutFinishModal: React.FC<WorkoutFinishModalProps> = ({
  isOpen,
  workout,
  elapsedSeconds,
  calculatedCalories,
  onClose,
  onSaveToHistory,
  isDark,
}) => {
  const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

  useEffect(() => {
    if (isOpen) {
      // Fire celebration confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#2563eb', '#38bdf8', '#fbbf24', '#34d399', '#f43f5e'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const completedExercisesCount = workout.exercises.filter(
    e => e.completedSets >= e.sets
  ).length;

  const handleConfirm = () => {
    onSaveToHistory({
      workout,
      caloriesBurned: calculatedCalories,
      durationMinutes,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl border flex flex-col items-center text-center z-10 ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          {/* Trophy / Fire Animated Badge */}
          <div className="relative mb-3 mt-2">
            <div className="w-20 h-20 rounded-3xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-900/30 animate-bounce">
              <span
                className="material-symbols-outlined text-[42px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
          </div>

          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl tracking-tight">
            Тренировка завершена! 🎉
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            Отличный результат! Био-ритм зафиксирован, калории рассчитаны и готовы к записи в историю.
          </p>

          {/* Program Title Banner */}
          <div className="mt-4 px-3.5 py-1.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-xs font-semibold text-zinc-300">
            {workout.title} ({workout.muscleGroup})
          </div>

          {/* Main Calorie Metric Card */}
          <div className="w-full my-5 p-4 rounded-2xl bg-gradient-to-b from-blue-600/15 to-transparent border border-blue-500/30 flex flex-col items-center justify-center">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400">
              Сброшено за тренировку
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-4xl text-blue-400">
                +{calculatedCalories}
              </span>
              <span className="text-base font-bold text-blue-400/80">ккал</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Расчет по формуле MET на основе {workout.exercises.length} упражнений и времени активности
            </p>
          </div>

          {/* Breakdown Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-2.5 mb-5 text-left">
            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Время в работе
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-[18px] text-blue-400">timer</span>
                <span className="font-bold text-sm">{durationMinutes} минут</span>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Упражнений закрыто
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-[18px] text-emerald-400">task_alt</span>
                <span className="font-bold text-sm">
                  {completedExercisesCount} из {workout.exercises.length}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 h-12 rounded-xl font-semibold text-xs border transition-all ${
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700'
              }`}
            >
              Продолжить
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Сохранить в историю
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
