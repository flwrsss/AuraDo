import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkoutSession, UserProfile, CompletedWorkoutLog } from '../types';
import { useTranslation } from '../translations';
import confetti from 'canvas-confetti';
import { SwipeableRow } from './SwipeableRow';
import { AddCustomWorkoutModal } from './AddCustomWorkoutModal';
import { PresetWorkoutsModal } from './PresetWorkoutsModal';
import { WorkoutFinishModal } from './WorkoutFinishModal';

interface WorkoutsScreenProps {
  workout: WorkoutSession;
  workoutsList: WorkoutSession[];
  workoutHistory: CompletedWorkoutLog[];
  profile: UserProfile;
  onUpdateWorkout: (updated: WorkoutSession) => void;
  onSelectActiveWorkout: (workout: WorkoutSession) => void;
  onAddCustomWorkout: (workout: WorkoutSession) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onCompleteWorkout: (summary: {
    workout: WorkoutSession;
    caloriesBurned: number;
    durationMinutes: number;
  }) => void;
  onAddCalories: (cals: number) => void;
  todayCalories: number;
  targetCalories: number;
}

export const WorkoutsScreen: React.FC<WorkoutsScreenProps> = ({
  workout,
  workoutsList,
  workoutHistory,
  profile,
  onUpdateWorkout,
  onSelectActiveWorkout,
  onAddCustomWorkout,
  onDeleteWorkout,
  onCompleteWorkout,
  onAddCalories,
  todayCalories,
  targetCalories,
}) => {
  const { t } = useTranslation(profile.language);
  const isDark = profile.theme === 'dark';

  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'history'>('today');

  // Modals state
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  // Active workout live timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(workout.durationMinutes ? workout.durationMinutes * 60 : 2700);
  const [elapsedWorkoutSeconds, setElapsedWorkoutSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Quick Calorie Calculator states
  const [calcActivity, setCalcActivity] = useState('Гребной тренажер');
  const [calcDuration, setCalcDuration] = useState(15);
  const [calcFeedback, setCalcFeedback] = useState<string | null>(null);

  // Timer interval
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
        setElapsedWorkoutSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Dynamic metrics
  const burnPercent = Math.min(100, Math.round((todayCalories / targetCalories) * 100));
  const remainingCals = Math.max(0, targetCalories - todayCalories);
  const ringCircumference = 301.6;
  const ringOffset = ringCircumference - (burnPercent / 100) * ringCircumference;

  // Completed exercises count in current active workout
  const completedExercisesCount = workout.exercises.filter(
    ex => ex.completedSets >= ex.sets
  ).length;

  const allExercisesCompleted =
    workout.exercises.length > 0 && completedExercisesCount === workout.exercises.length;

  // Calculate calories burned in current session based on completed sets and elapsed time
  const currentSessionCalories = workout.exercises.reduce((sum, ex) => {
    const ratio = ex.sets > 0 ? ex.completedSets / ex.sets : 0;
    return sum + Math.round(ratio * ex.calories);
  }, 0);

  // Handle logging a set for an exercise
  const handleLogSet = (exerciseId: string) => {
    const updatedExercises = workout.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const nextCompleted = Math.min(ex.sets, ex.completedSets + 1);
        return {
          ...ex,
          completedSets: nextCompleted,
          active: nextCompleted < ex.sets,
        };
      }
      return ex;
    });

    onUpdateWorkout({
      ...workout,
      exercises: updatedExercises,
    });

    // Add +30 kcal incrementally to today's burn
    onAddCalories(30);

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.6 },
      colors: ['#00f1fd', '#7928ca'],
    });

    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
  };

  // Quick toggle complete on exercise
  const handleToggleExerciseComplete = (exerciseId: string) => {
    const targetEx = workout.exercises.find(e => e.id === exerciseId);
    if (!targetEx) return;

    const isAlreadyDone = targetEx.completedSets >= targetEx.sets;
    const nextCompleted = isAlreadyDone ? 0 : targetEx.sets;

    const updatedExercises = workout.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          completedSets: nextCompleted,
          active: nextCompleted < ex.sets,
        };
      }
      return ex;
    });

    onUpdateWorkout({
      ...workout,
      exercises: updatedExercises,
    });

    if (!isAlreadyDone) {
      onAddCalories(targetEx.calories);
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#2563eb', '#38bdf8', '#34d399'],
      });
    }
  };

  // Open finish workout celebration modal
  const handleTriggerFinishWorkout = () => {
    setIsTimerRunning(false);
    setIsFinishModalOpen(true);
  };

  const handleAddQuickCalories = () => {
    const added = calcDuration * 8;
    onAddCalories(added);
    setCalcFeedback(`Добавлено +${added} ккал!`);

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.75 },
    });

    setTimeout(() => {
      setCalcFeedback(null);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full max-w-lg mx-auto px-4 pb-28 pt-2 space-y-4"
    >
      {/* Top Hero Widget: Biometric Aurora Ring & Calorie Target */}
      <section
        className={`relative overflow-hidden rounded-2xl p-5 shadow-xl transition-all duration-300 ${
          isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'
        }`}
      >
        <div className="relative z-10 flex flex-col space-y-3">
          {/* Header & Status Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span
                className="material-symbols-outlined text-blue-500 text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <h2
                className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}
              >
                {t.burnedToday}
              </h2>
            </div>

            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                isDark
                  ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              {t.inRhythm}
            </span>
          </div>

          {/* Ring Progress & Metrics Snapshot */}
          <div className="flex items-center justify-between gap-4 pt-1">
            {/* Circular Arc Visualizer */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="auroraBurnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <circle
                  className={isDark ? 'text-zinc-800' : 'text-zinc-200'}
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="9"
                />
                <circle
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="48"
                  stroke="url(#auroraBurnGrad)"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  strokeWidth="9.5"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span
                  className={`font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-3xl leading-none ${
                    isDark ? 'text-zinc-100' : 'text-zinc-900'
                  }`}
                >
                  {burnPercent}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 mt-0.5">
                  {t.goalLabel}
                </span>
              </div>
            </div>

            {/* Metrics Snapshot Grid */}
            <div className="flex flex-col justify-center space-y-2 flex-1 min-w-0">
              <div className="flex items-baseline space-x-1">
                <span
                  className={`font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-3xl ${
                    isDark ? 'text-zinc-100' : 'text-zinc-900'
                  }`}
                >
                  {todayCalories}
                </span>
                <span className="text-xs text-zinc-400 font-medium">/ {targetCalories} ккал</span>
              </div>

              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-blue-400">timer</span>
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                    Таймер:{' '}
                    <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>
                      {formatTime(timerSeconds)}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-blue-500">task_alt</span>
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                    Выполнено:{' '}
                    <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>
                      {completedExercisesCount} / {workout.exercises.length}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Energy Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{t.energyDynamics}</span>
              <span className="text-blue-400 font-semibold">
                +{remainingCals} ккал до закрытия кольца
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-700 shadow-sm"
                style={{ width: `${burnPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Action Shortcuts: Add Custom & Presets Library */}
      <section className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setIsAddCustomOpen(true)}
          className={`p-3 rounded-2xl border flex items-center gap-3 transition-all active:scale-[0.98] text-left shadow-sm ${
            isDark
              ? 'bg-zinc-900 hover:bg-zinc-800/80 border-zinc-800 hover:border-blue-500/50'
              : 'bg-white hover:bg-blue-50/50 border-zinc-200 hover:border-blue-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs truncate">Свой план</h4>
            <p className="text-[10px] text-zinc-400 truncate">Добавить упражнения</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsPresetsOpen(true)}
          className={`p-3 rounded-2xl border flex items-center gap-3 transition-all active:scale-[0.98] text-left shadow-sm ${
            isDark
              ? 'bg-zinc-900 hover:bg-zinc-800/80 border-zinc-800 hover:border-blue-500/50'
              : 'bg-white hover:bg-blue-50/50 border-zinc-200 hover:border-blue-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <span className="material-symbols-outlined text-[22px]">format_list_bulleted</span>
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs truncate">Готовые планы</h4>
            <p className="text-[10px] text-zinc-400 truncate">Выбрать программу</p>
          </div>
        </button>
      </section>

      {/* Segmented Time Tabs: Сегодня / Все планы / История */}
      <section className="w-full">
        <div
          className={`flex p-1 rounded-xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'today'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {t.tabToday}
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'week'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Все тренировки ({workoutsList.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {t.tabHistory} ({workoutHistory.length})
          </button>
        </div>
      </section>

      {/* TAB 1: TODAY ACTIVE WORKOUT SESSION */}
      {activeTab === 'today' && (
        <>
          {/* Active Workout Card */}
          <section className="flex flex-col space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-[20px]">
                  fitness_center
                </span>
                <h3
                  className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg ${
                    isDark ? 'text-zinc-100' : 'text-zinc-900'
                  }`}
                >
                  Основная тренировка на сегодня
                </h3>
              </div>
              {workout && workout.title && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center gap-1 border border-amber-500/30">
                  <span className="material-symbols-outlined text-[13px]">push_pin</span>
                  Основная
                </span>
              )}
            </div>

            {/* Empty state when user hasn't added or chosen a workout yet */}
            {(!workout || !workout.title || !workout.exercises || workout.exercises.length === 0) ? (
              <div
                className={`p-6 rounded-2xl text-center border space-y-4 ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-[30px]">fitness_center</span>
                </div>
                <div>
                  <h4 className="font-bold text-base font-['Plus_Jakarta_Sans',sans-serif]">
                    Нет активной тренировки на сегодня
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    Создайте собственный план с упражнениями и подходами или выберите готовую программу из библиотеки.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={() => setIsAddCustomOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Создать свой план</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPresetsOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                    <span>Выбрать готовую</span>
                  </button>
                </div>
              </div>
            ) : (
            /* Active Program Main Card */
            <div
              className={`rounded-2xl p-4 shadow-xl space-y-4 border ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
              }`}
            >
              {/* Header Info */}
              <div className="flex gap-3 items-start">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-800 shadow-inner">
                  <img
                    src={workout.image}
                    alt={workout.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-blue-950/40 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-800/40">
                      {workout.muscleGroup}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
                      {workout.type}
                    </span>
                  </div>
                  <h4
                    className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base truncate ${
                      isDark ? 'text-zinc-100' : 'text-zinc-900'
                    }`}
                  >
                    {workout.title}
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    ~{workout.caloriesEstimate} ккал · {workout.durationMinutes} мин ·{' '}
                    {workout.exercises.length} упражнений
                  </p>
                </div>

                {/* Workout Timer Control Widget */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-md ${
                      isTimerRunning
                        ? 'bg-amber-600 text-white shadow-amber-900/30'
                        : 'bg-blue-600 text-white shadow-blue-900/30'
                    }`}
                    title={isTimerRunning ? 'Пауза' : 'Запустить таймер'}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {isTimerRunning ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <span className="text-[10px] font-bold text-blue-400 mt-1">
                    {formatTime(timerSeconds)}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Calorie Burned in this session */}
              <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    Прогресс тренировки
                  </span>
                  <span className="text-xs font-bold text-zinc-200">
                    {completedExercisesCount} из {workout.exercises.length} упражнений выполнено
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-blue-400 block">
                    Сожжено в процессе
                  </span>
                  <span className="text-sm font-extrabold text-blue-400">
                    +{currentSessionCalories} ккал
                  </span>
                </div>
              </div>

              {/* Interactive Exercise List with Checkboxes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Чек-лист упражнений
                  </span>
                  <span className="text-[11px] text-zinc-500">Нажимайте для отметки</span>
                </div>

                {workout.exercises.map((exercise, idx) => {
                  const isCompleted = exercise.completedSets >= exercise.sets;

                  return (
                    <div
                      key={exercise.id || idx}
                      className={`p-3 rounded-xl transition-all border ${
                        isCompleted
                          ? isDark
                            ? 'bg-zinc-900/60 border-emerald-900/40 text-zinc-300'
                            : 'bg-emerald-50/70 border-emerald-200 text-zinc-800'
                          : isDark
                          ? 'bg-zinc-800/40 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleExerciseComplete(exercise.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all border ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                              : isDark
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                              : 'bg-white border-zinc-300 text-zinc-400'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isCompleted ? 'check' : 'radio_button_unchecked'}
                          </span>
                        </button>

                        {/* Exercise Name and Details */}
                        <div
                          className="min-w-0 flex-1 cursor-pointer"
                          onClick={() => handleLogSet(exercise.id)}
                        >
                          <p
                            className={`text-sm font-semibold truncate ${
                              isCompleted ? 'line-through opacity-70' : ''
                            } ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
                          >
                            {exercise.name}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {exercise.sets} подхода × {exercise.reps} повт · {exercise.calories} ккал
                          </p>
                        </div>

                        {/* Set count badge & Quick log button */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleLogSet(exercise.id)}
                            disabled={isCompleted}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm active:scale-95'
                            }`}
                          >
                            {isCompleted ? 'Готово' : `+ Подход (${exercise.completedSets}/${exercise.sets})`}
                          </button>
                        </div>
                      </div>

                      {/* Mini progress bar for sets */}
                      <div className="w-full h-1 rounded-full bg-zinc-800 mt-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${Math.round((exercise.completedSets / exercise.sets) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FINISH WORKOUT MAIN BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTriggerFinishWorkout}
                  className={`w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] cursor-pointer ${
                    allExercisesCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30 animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">flag</span>
                  <span>Завершить тренировку & посчитать калории</span>
                </button>
                <p className="text-[11px] text-zinc-500 text-center mt-1.5">
                  По завершении калории добавятся к дневной норме и запишутся в историю
                </p>
              </div>
            </div>
            )}
          </section>

          {/* Quick Calorie Calculator Card */}
          <section
            className={`rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden border ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <span className="material-symbols-outlined text-[22px]">calculate</span>
              </div>
              <div className="min-w-0">
                <h4
                  className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base truncate ${
                    isDark ? 'text-zinc-100' : 'text-zinc-900'
                  }`}
                >
                  {t.quickCalorieCalc}
                </h4>
                <p className="text-xs text-zinc-400 truncate">{t.calcSubtext}</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`p-2.5 rounded-xl flex flex-col justify-center border ${
                  isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold text-zinc-400">
                  {t.activity}
                </span>
                <select
                  value={calcActivity}
                  onChange={e => setCalcActivity(e.target.value)}
                  className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer mt-0.5 ${
                    isDark ? 'text-zinc-100' : 'text-zinc-900'
                  }`}
                >
                  <option value="Гребной тренажер">Гребной тренажер</option>
                  <option value="Бег на улице">Бег на улице</option>
                  <option value="Плавание">Плавание</option>
                  <option value="Велотренажер">Велотренажер</option>
                  <option value="Скакалка (HIIT)">Скакалка (HIIT)</option>
                </select>
              </div>

              <div
                className={`p-2.5 rounded-xl flex flex-col justify-center border ${
                  isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold text-zinc-400">
                  {t.duration}
                </span>
                <select
                  value={calcDuration}
                  onChange={e => setCalcDuration(Number(e.target.value))}
                  className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer mt-0.5 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  <option value={10}>10 мин (~80 ккал)</option>
                  <option value={15}>15 мин (~120 ккал)</option>
                  <option value={30}>30 мин (~240 ккал)</option>
                  <option value={45}>45 мин (~360 ккал)</option>
                  <option value={60}>60 мин (~480 ккал)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddQuickCalories}
              type="button"
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>{calcFeedback || t.addToExpense}</span>
            </button>
          </section>
        </>
      )}

      {/* TAB 2: ALL WORKOUT PLANS (WITH SWIPE-TO-ACTION) */}
      {activeTab === 'week' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base">Все программы и планы</h3>
            <span className="text-xs text-zinc-400">Свайп влево для управления</span>
          </div>

          {/* Swipe gesture helper pill */}
          <div className="px-3 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-xs text-blue-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">swipe_left</span>
            <span>
              Свайпните карточку тренировки <strong>влево</strong>, чтобы закрепить как основную на
              сегодня или удалить.
            </span>
          </div>

          {workoutsList.length === 0 ? (
            <div
              className={`p-8 rounded-2xl border text-center space-y-3 ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">fitness_center</span>
              </div>
              <p className="font-bold text-sm">Планы тренировок пока не созданы</p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Добавьте свой собственный план или выберите готовую программу тренировок.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-900/30 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  <span>Свой план</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPresetsOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">format_list_bulleted</span>
                  <span>Готовые программы</span>
                </button>
              </div>
            </div>
          ) : (
          <div className="space-y-2.5">
            {workoutsList.map(w => {
              const isMain = w.id === workout.id;

              return (
                <SwipeableRow
                  key={w.id}
                  id={w.id}
                  isPinned={isMain}
                  onTogglePin={() => onSelectActiveWorkout(w)}
                  onDelete={() => onDeleteWorkout(w.id)}
                  pinLabel="Сделать основной"
                  unpinLabel="Текущая"
                  deleteLabel="Удалить"
                  isDark={isDark}
                >
                  <div
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isMain
                        ? isDark
                          ? 'bg-zinc-900 border-blue-500/60 shadow-md shadow-blue-950/20'
                          : 'bg-white border-blue-400 shadow-md'
                        : isDark
                        ? 'bg-zinc-900/70 border-zinc-800'
                        : 'bg-white border-zinc-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-800">
                        <img
                          src={w.image}
                          alt={w.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-blue-950/40 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-800/40">
                            {w.muscleGroup}
                          </span>
                          {isMain && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[11px]">push_pin</span>
                              Основная
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm truncate">{w.title}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {w.exercises.length} упражнений · {w.durationMinutes} мин · ~
                          {w.caloriesEstimate} ккал
                        </p>
                      </div>

                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => onSelectActiveWorkout(w)}
                          className="shrink-0 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                        >
                          <span>Выбрать</span>
                        </button>
                      )}
                    </div>
                  </div>
                </SwipeableRow>
              );
            })}
          </div>
          )}
        </section>
      )}

      {/* TAB 3: WORKOUT HISTORY LOGS (Остается в истории выполненных) */}
      {activeTab === 'history' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">history</span>
              <h3 className="font-bold text-base">История выполненных тренировок</h3>
            </div>
            <span className="text-xs font-semibold text-zinc-400">
              {workoutHistory.length} записей
            </span>
          </div>

          {workoutHistory.length === 0 ? (
            <div
              className={`p-8 rounded-2xl border text-center space-y-2 ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <span className="material-symbols-outlined text-[40px] text-zinc-500">
                fitness_center
              </span>
              <p className="font-bold text-sm">История пока пуста</p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Завершите свою первую тренировку во вкладке «Сегодня», и она появится здесь со всеми
                сожженными калориями!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {workoutHistory.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-semibold text-zinc-400">
                          {item.completedAt}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                          {item.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm truncate">{item.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {item.muscleGroup} · {item.durationMinutes} мин
                      </p>
                    </div>

                    {/* Calories Burned Pill */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="px-3 py-1 rounded-xl bg-blue-600/20 text-blue-400 text-xs font-extrabold flex items-center gap-1 border border-blue-500/30">
                        <span
                          className="material-symbols-outlined text-[14px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          local_fire_department
                        </span>
                        +{item.caloriesBurned} ккал
                      </span>
                    </div>
                  </div>

                  {/* Exercises summary chips */}
                  {item.exercisesSummary && item.exercisesSummary.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/50 flex flex-wrap gap-1.5">
                      {item.exercisesSummary.map((exName, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-zinc-800/60 text-[10px] text-zinc-400 font-medium"
                        >
                          {exName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal: Add Custom Workout */}
      <AddCustomWorkoutModal
        isOpen={isAddCustomOpen}
        onClose={() => setIsAddCustomOpen(false)}
        onSave={onAddCustomWorkout}
        isDark={isDark}
      />

      {/* Modal: Choose from Ready-Made Preset Workouts */}
      <PresetWorkoutsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={onSelectActiveWorkout}
        isDark={isDark}
      />

      {/* Modal: Finish Workout Celebration & Calorie Calculation */}
      <WorkoutFinishModal
        isOpen={isFinishModalOpen}
        workout={workout}
        elapsedSeconds={elapsedWorkoutSeconds > 0 ? elapsedWorkoutSeconds : 1800}
        calculatedCalories={
          currentSessionCalories > 0 ? currentSessionCalories : workout.caloriesEstimate
        }
        onClose={() => setIsFinishModalOpen(false)}
        onSaveToHistory={onCompleteWorkout}
        isDark={isDark}
      />
    </motion.div>
  );
};
