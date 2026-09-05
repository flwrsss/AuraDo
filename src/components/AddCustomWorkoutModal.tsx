import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkoutSession, ExerciseItem } from '../types';

interface AddCustomWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workout: WorkoutSession) => void;
  isDark: boolean;
}

export const AddCustomWorkoutModal: React.FC<AddCustomWorkoutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isDark,
}) => {
  const [title, setTitle] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Все тело');
  const [workoutType, setWorkoutType] = useState('Силовая');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [setAsActive, setSetAsActive] = useState(true);

  // Exercises list
  const [exercises, setExercises] = useState<Array<{ name: string; sets: number; reps: number; calories: number }>>([
    { name: 'Разминка и кардио', sets: 1, reps: 10, calories: 60 },
    { name: 'Базовое упражнение', sets: 4, reps: 10, calories: 120 },
  ]);

  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState(12);

  const totalCalculatedCalories = exercises.reduce((sum, e) => sum + e.calories, 0);

  const handleAddExercise = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newExName.trim()) return;
    const estCal = Math.round(newExSets * newExReps * 2.5);
    setExercises([
      ...exercises,
      {
        name: newExName.trim(),
        sets: Number(newExSets),
        reps: Number(newExReps),
        calories: estCal > 0 ? estCal : 80,
      },
    ]);
    setNewExName('');
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleSaveWorkout = () => {
    const finalTitle = title.trim() || 'Моя тренировка ' + new Date().toLocaleDateString('ru-RU');
    const finalExercises: ExerciseItem[] = exercises.map((e, idx) => ({
      id: 'ex-' + Date.now() + '-' + idx,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      completedSets: 0,
      calories: e.calories,
      active: idx === 0,
    }));

    const newWorkout: WorkoutSession = {
      id: 'workout-' + Date.now(),
      title: finalTitle,
      muscleGroup,
      type: workoutType,
      caloriesEstimate: Math.max(150, totalCalculatedCalories),
      durationMinutes,
      exerciseCount: finalExercises.length,
      exercises: finalExercises,
      image:
        workoutType === 'HIIT'
          ? 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=500&auto=format&fit=crop&q=60'
          : workoutType === 'Растяжка'
          ? 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=60'
          : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
      isPinned: setAsActive,
      status: 'planned',
      createdAt: new Date().toISOString(),
    };

    onSave(newWorkout);
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
                <span className="material-symbols-outlined text-[20px]">fitness_center</span>
              </div>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg leading-tight">
                  Свой план тренировки
                </h3>
                <p className="text-xs text-zinc-400">Составьте персональный план упражнений на сегодня</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Scrollable Form Content */}
          <div className="overflow-y-auto space-y-4 py-4 flex-1 pr-1">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Название тренировки
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Например: Моя силовая на грудь и плечи"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-blue-500 transition-all ${
                  isDark ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            {/* Type & Muscle Group */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Тип
                </label>
                <select
                  value={workoutType}
                  onChange={e => setWorkoutType(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none cursor-pointer ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                  }`}
                >
                  <option value="Силовая">Силовая</option>
                  <option value="HIIT">HIIT Жиросжигание</option>
                  <option value="Кардио">Кардио</option>
                  <option value="Растяжка">Растяжка / Йога</option>
                  <option value="Кроссфит">Кроссфит</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Группа мышц
                </label>
                <select
                  value={muscleGroup}
                  onChange={e => setMuscleGroup(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none cursor-pointer ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                  }`}
                >
                  <option value="Все тело">Все тело (Full Body)</option>
                  <option value="Грудь и Трицепс">Грудь и Трицепс</option>
                  <option value="Спина и Бицепс">Спина и Бицепс</option>
                  <option value="Ноги и Ягодицы">Ноги и Ягодицы</option>
                  <option value="Плечи и Руки">Плечи и Руки</option>
                  <option value="Пресс и Кор">Пресс и Кор</option>
                </select>
              </div>
            </div>

            {/* Duration & Estimated Calories Summary */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-600/10 border border-blue-500/20">
              <div className="flex-1">
                <span className="text-[11px] text-zinc-400 block">Длительность:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="number"
                    min={10}
                    max={180}
                    step={5}
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className={`w-16 px-2 py-1 rounded-lg text-xs font-bold text-center border ${
                      isDark ? 'bg-zinc-800 border-zinc-700 text-blue-400' : 'bg-white border-zinc-300 text-blue-600'
                    }`}
                  />
                  <span className="text-xs font-semibold text-zinc-400">минут</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-zinc-400 block">Расход (расчет):</span>
                <span className="text-sm font-extrabold text-blue-400 flex items-center justify-end gap-1">
                  <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                  ~{totalCalculatedCalories} ккал
                </span>
              </div>
            </div>

            {/* Exercises Builder */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Список упражнений ({exercises.length})
                </label>
                <span className="text-[11px] text-zinc-500">Минимум 1 упражнение</span>
              </div>

              {/* Added exercises list */}
              <div className="space-y-2">
                {exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      isDark ? 'bg-zinc-800/60 border-zinc-700/80' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{ex.name}</p>
                        <p className="text-[11px] text-zinc-400">
                          {ex.sets} подходов × {ex.reps} повт · ~{ex.calories} ккал
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="w-7 h-7 rounded-lg text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-all"
                      title="Удалить упражнение"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Exercise Inline Form */}
              <div
                className={`p-3 rounded-xl border space-y-2.5 ${
                  isDark ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-100/60 border-zinc-200'
                }`}
              >
                <span className="text-[11px] font-bold text-blue-400 block">+ Добавить упражнение:</span>
                <input
                  type="text"
                  value={newExName}
                  onChange={e => setNewExName(e.target.value)}
                  placeholder="Название (например: Жим лежа, Планка, Бёрпи)"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExercise();
                    }
                  }}
                />

                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400">Подходы:</span>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={newExSets}
                      onChange={e => setNewExSets(Number(e.target.value))}
                      className={`w-12 px-1.5 py-1 rounded-lg text-xs font-bold text-center border ${
                        isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                      }`}
                    />
                  </div>

                  <div className="flex-1 flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400">Повторы:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newExReps}
                      onChange={e => setNewExReps(Number(e.target.value))}
                      className={`w-14 px-1.5 py-1 rounded-lg text-xs font-bold text-center border ${
                        isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddExercise}
                    disabled={!newExName.trim()}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    Добавить
                  </button>
                </div>
              </div>
            </div>

            {/* Set as Primary Workout Checkbox */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/20 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={setAsActive}
                onChange={e => setSetAsActive(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span className="text-xs font-medium">Сделать этот план основной тренировкой на сегодня</span>
            </label>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/60 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 h-11 rounded-xl font-semibold text-xs transition-all border ${
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700'
              }`}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSaveWorkout}
              disabled={exercises.length === 0}
              className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Сохранить план
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
