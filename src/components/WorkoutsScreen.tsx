import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WorkoutSession, UserProfile } from '../types';
import { useTranslation } from '../translations';
import confetti from 'canvas-confetti';

interface WorkoutsScreenProps {
  workout: WorkoutSession;
  profile: UserProfile;
  onUpdateWorkout: (updated: WorkoutSession) => void;
  onAddCalories: (cals: number) => void;
  todayCalories: number;
  targetCalories: number;
}

export const WorkoutsScreen: React.FC<WorkoutsScreenProps> = ({
  workout,
  profile,
  onUpdateWorkout,
  onAddCalories,
  todayCalories,
  targetCalories,
}) => {
  const { t } = useTranslation(profile.language);
  const isDark = profile.theme === 'dark';

  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'history'>('today');
  const [calcActivity, setCalcActivity] = useState('Гребной тренажер');
  const [calcDuration, setCalcDuration] = useState(15);
  const [calcFeedback, setCalcFeedback] = useState<string | null>(null);

  // Dynamic calculations
  const burnPercent = Math.min(100, Math.round((todayCalories / targetCalories) * 100));
  const remainingCals = Math.max(0, targetCalories - todayCalories);

  // Concentric ring calculation (radius 48, circumference ~301.6)
  const ringCircumference = 301.6;
  const ringOffset = ringCircumference - (burnPercent / 100) * ringCircumference;

  // Completed exercises count
  const completedExercisesCount = workout.exercises.filter(
    ex => ex.completedSets >= ex.sets
  ).length;

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

    // Add 30 kcal to current daily burn
    onAddCalories(30);

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.6 },
      colors: ['#00f1fd', '#7928ca'],
    });
  };

  const handleAddQuickCalories = () => {
    // estimate ~8 kcal per minute
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
          isDark
            ? 'bg-zinc-900 border border-zinc-800'
            : 'bg-white border border-zinc-200 shadow-sm'
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
                isDark ? 'bg-zinc-800 text-emerald-400 border border-zinc-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
                    <stop offset="100%" stopColor="#3b82f6" />
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
                    {t.timeLabel}: <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>48 мин</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-blue-500">
                    task_alt
                  </span>
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                    {t.exercisesLabel}:{' '}
                    <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>
                      {completedExercisesCount} / {workout.exerciseCount}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Energy Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                {t.energyDynamics}
              </span>
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

      {/* Segmented Time Tabs: Сегодня / План недели / История */}
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
            {t.tabWeekPlan}
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
            {t.tabHistory}
          </button>
        </div>
      </section>

      {/* Current Workout Routine Card */}
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
              {t.currentWorkout}
            </h3>
          </div>
          <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
            <span>{t.details}</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Active Program Main Card */}
        <div
          className={`rounded-2xl p-4 shadow-xl space-y-3.5 border ${
            isDark
              ? 'bg-zinc-900 border-zinc-800'
              : 'bg-white border-zinc-200 shadow-sm'
          }`}
        >
          {/* Header */}
          <div className="flex gap-3 items-start">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-800 shadow-inner">
              <img
                src={workout.image}
                alt="Workout banner"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
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
                {t.workoutMeta}
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-blue-400 shrink-0">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-2">
            {workout.exercises.map(exercise => {
              const isCompleted = exercise.completedSets >= exercise.sets;
              const isActive = exercise.active && !isCompleted;

              if (isActive) {
                // Active Highlighted Exercise Card
                return (
                  <div
                    key={exercise.id}
                    className={`relative overflow-hidden rounded-xl p-3.5 space-y-2 transition-all border ${
                      isDark
                        ? 'bg-zinc-800/60 border-blue-500/40'
                        : 'bg-blue-50/70 border-blue-300 shadow-sm'
                    }`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                          <span className="material-symbols-outlined text-[16px] animate-pulse">
                            fitness_center
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-sm font-bold truncate ${
                                isDark ? 'text-zinc-100' : 'text-zinc-900'
                              }`}
                            >
                              {exercise.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-600/20 text-blue-400 text-[10px] font-bold">
                              Подход {exercise.completedSets + 1}/{exercise.sets}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400">
                            {exercise.sets} подхода × {exercise.reps} повт · {exercise.calories} ккал
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-blue-400 shrink-0">
                        {Math.round((exercise.completedSets / exercise.sets) * exercise.calories)} /{' '}
                        {exercise.calories} ккал
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{
                          width: `${Math.round((exercise.completedSets / exercise.sets) * 100)}%`,
                        }}
                      />
                    </div>

                    {/* Interactive Action Button */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleLogSet(exercise.id)}
                        type="button"
                        className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/30 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                        <span>{t.markSet}</span>
                      </button>

                      <button
                        type="button"
                        className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center border border-zinc-700"
                        title="Таймер отдыха"
                      >
                        <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                      </button>
                    </div>
                  </div>
                );
              }

              // Standard Completed or Pending Exercise
              return (
                <div
                  key={exercise.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all border ${
                    isCompleted
                      ? isDark
                        ? 'bg-zinc-900/40 border-zinc-800/50 opacity-60'
                        : 'bg-zinc-100 border-zinc-200 opacity-60'
                      : isDark
                      ? 'bg-zinc-800/40 border-zinc-800 hover:border-zinc-700'
                      : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        isCompleted
                          ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isCompleted ? 'check' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCompleted ? 'line-through opacity-70' : ''
                        } ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
                      >
                        {exercise.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {exercise.sets} подхода × {exercise.reps} повт
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold shrink-0 ml-2 ${
                      isCompleted ? 'text-blue-400' : 'text-zinc-400'
                    }`}
                  >
                    {exercise.calories} ккал
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Calorie Calculator Card */}
      <section
        className={`rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden border ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-zinc-200 shadow-sm'
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
          {/* Activity Dropdown */}
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
              <option value="Гребной тренажер" className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white'}>
                Гребной тренажер
              </option>
              <option value="Бег на улице" className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white'}>
                Бег на улице
              </option>
              <option value="Плавание" className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white'}>
                Плавание
              </option>
              <option value="Велотренажер" className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white'}>
                Велотренажер
              </option>
              <option value="Скакалка (HIIT)" className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white'}>
                Скакалка (HIIT)
              </option>
            </select>
          </div>

          {/* Duration Selector */}
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
              <option value={10} className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white'}>
                10 мин (~80 ккал)
              </option>
              <option value={15} className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white'}>
                15 мин (~120 ккал)
              </option>
              <option value={30} className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white'}>
                30 мин (~240 ккал)
              </option>
              <option value={45} className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white'}>
                45 мин (~360 ккал)
              </option>
              <option value={60} className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white'}>
                60 мин (~480 ккал)
              </option>
            </select>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddQuickCalories}
          type="button"
          className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>{calcFeedback || t.addToExpense}</span>
        </button>
      </section>
    </motion.div>
  );
};
