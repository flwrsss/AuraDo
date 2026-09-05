import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DailyEnergyStats, UserProfile, TaskItem, WorkoutSession } from '../types';
import { useTranslation } from '../translations';
import { StorageService } from '../services/storage';
import confetti from 'canvas-confetti';

interface AnalyticsScreenProps {
  energyStats: DailyEnergyStats[];
  tasks: TaskItem[];
  workout: WorkoutSession;
  profile: UserProfile;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  energyStats,
  tasks,
  workout,
  profile,
}) => {
  const { t } = useTranslation(profile.language);
  const isDark = profile.theme === 'dark';

  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(3); // default Thursday (920 kcal peak)
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const totalWeeklyCals = energyStats.reduce((acc, curr) => acc + curr.calories, 0);
  const metCount = energyStats.filter(s => s.metGoal).length;
  const maxCals = Math.max(...energyStats.map(s => s.calories), 1000);

  const handleExportCSV = () => {
    StorageService.exportToCSV(energyStats, tasks, workout);
    setExportFeedback('CSV файл успешно сгенерирован!');
    setTimeout(() => setExportFeedback(null), 3000);
  };

  const handleExportPDF = () => {
    StorageService.exportToPDF(energyStats, tasks, workout, profile);
    setExportFeedback('Готово к печати/сохранению PDF!');
    setTimeout(() => setExportFeedback(null), 3000);
  };

  const triggerAchievementCheer = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00f1fd', '#7928ca', '#dbb8ff'],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full max-w-lg mx-auto px-4 pb-28 pt-2 space-y-4"
    >
      {/* Top Title & Period Switcher */}
      <section className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              {t.bioTrackingReport}
            </span>
            <h1
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-2xl tracking-tight ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              {t.analyticsAndProgress}
            </h1>
          </div>

          {/* Export Quick Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportCSV}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 flex items-center gap-1 border ${
                isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
              }`}
              title="Экспорт в CSV"
            >
              <span className="material-symbols-outlined text-[15px]">table_view</span>
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30"
              title="Экспорт в PDF"
            >
              <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {exportFeedback && (
          <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {exportFeedback}
            </span>
          </div>
        )}

        {/* Period Selector Tabs */}
        <div
          className={`flex p-1 rounded-xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
          }`}
        >
          {(['week', 'month', 'year'] as const).map(p => {
            const labels = { week: t.tabWeek, month: t.tabMonth, year: t.tabYear };
            const isSelected = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </section>

      {/* Energy Expenditure Interactive Weekly Bar Chart Card */}
      <section
        className={`relative overflow-hidden rounded-2xl p-5 shadow-xl transition-all border ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-zinc-200 shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span
              className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
            >
              {t.energyExpenditure}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-3xl ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}
              >
                {totalWeeklyCals.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-zinc-400">{t.calsBurned}</span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-emerald-400 text-xs font-semibold shadow-sm">
            <span className="material-symbols-outlined text-[15px]">trending_up</span>
            {t.vsPreviousWeek}
          </span>
        </div>

        {/* Goal Indicator text */}
        <div className="flex items-center justify-between text-xs pt-2 pb-1 border-b border-zinc-800">
          <span className="text-zinc-400">{t.dailyTargetGoal}</span>
          <span className="text-blue-400 font-semibold">
            {metCount} из {energyStats.length} дней выполнено
          </span>
        </div>

        {/* Interactive Bar Chart Graphic */}
        <div className="pt-4 pb-1">
          <div className="h-40 flex items-end justify-between gap-2 sm:gap-3 relative">
            {/* Target 700 kcal dashed threshold line */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-zinc-700 flex items-center justify-end pr-1 pointer-events-none z-0"
              style={{ bottom: `${(700 / maxCals) * 100}%` }}
            >
              <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1 rounded -translate-y-2">
                Цель 700
              </span>
            </div>

            {energyStats.map((stat, idx) => {
              const heightPercent = Math.min(100, Math.round((stat.calories / maxCals) * 100));
              const isSelected = selectedDayIndex === idx;

              return (
                <div
                  key={stat.day}
                  onClick={() => setSelectedDayIndex(idx)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative z-10"
                >
                  {/* Tooltip on active */}
                  {isSelected && (
                    <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] whitespace-nowrap shadow-md">
                      {stat.calories} ккал
                    </div>
                  )}

                  <div className="w-full flex items-end justify-center h-32">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-blue-600 shadow-md shadow-blue-900/40'
                          : stat.metGoal
                          ? 'bg-blue-600/70 group-hover:bg-blue-600'
                          : isDark
                          ? 'bg-zinc-800 group-hover:bg-zinc-700'
                          : 'bg-zinc-200 group-hover:bg-zinc-300'
                      }`}
                    />
                  </div>

                  <span
                    className={`text-[11px] font-semibold mt-2 transition-colors ${
                      isSelected
                        ? 'text-blue-400 font-bold'
                        : isDark
                        ? 'text-zinc-400'
                        : 'text-zinc-600'
                    }`}
                  >
                    {stat.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bento Metric Cards Strip */}
      <section className="grid grid-cols-3 gap-2.5">
        {/* 1. Tasks Completion */}
        <div
          className={`p-3 rounded-xl flex flex-col justify-between shadow-sm border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-zinc-400">{t.tasksMetric}</span>
          <div className="flex items-center justify-between my-1">
            <span
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              88%
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">task_alt</span>
            </div>
          </div>
          <span className="text-[10px] text-blue-400 font-semibold">{t.greatTempo}</span>
        </div>

        {/* 2. Streak Flame */}
        <div
          onClick={triggerAchievementCheer}
          className={`p-3 rounded-xl flex flex-col justify-between shadow-sm cursor-pointer transition-transform active:scale-95 border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-zinc-400">{t.streakFlame}</span>
          <div className="flex items-center justify-between my-1">
            <span
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              6 {t.daysCount}
            </span>
            <div className="w-6 h-6 rounded-md bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
            </div>
          </div>
          <span className="text-[10px] text-amber-400 font-semibold">{t.personalRecord}</span>
        </div>

        {/* 3. Sport Time */}
        <div
          className={`p-3 rounded-xl flex flex-col justify-between shadow-sm border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-zinc-400">{t.sportTime}</span>
          <div className="flex items-center justify-between my-1">
            <span
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              310 {t.minutesCount}
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">timer</span>
            </div>
          </div>
          <span className="text-[10px] text-blue-400 font-semibold">{t.plusPlan}</span>
        </div>
      </section>

      {/* AI Correlation Insight Card */}
      <section
        className={`p-4 rounded-xl shadow-sm border relative overflow-hidden ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-zinc-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm flex items-center gap-1.5 ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              <span>{t.activityFocusConnection}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                +34%
              </span>
            </h4>
            <p
              className={`text-xs mt-1 leading-relaxed ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              {t.insightText}
            </p>
          </div>
        </div>
      </section>

      {/* Load Structure & Donut Distribution */}
      <section
        className={`p-4 rounded-xl shadow-sm space-y-3 border ${
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
            {t.loadStructure}
          </h4>
          <span className="text-xs font-semibold text-blue-400">{t.totalSessions}</span>
        </div>

        {/* Segmented Distribution Bars */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-zinc-800">
          <div className="h-full bg-blue-600" style={{ width: '45%' }} title="Силовые 45%" />
          <div className="h-full bg-indigo-500" style={{ width: '30%' }} title="Кардио 30%" />
          <div className="h-full bg-sky-400" style={{ width: '15%' }} title="Растяжка 15%" />
          <div className="h-full bg-emerald-400" style={{ width: '10%' }} title="Прогулки 10%" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
              {t.strengthShare}: <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>45%</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
              {t.cardioShare}: <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>30%</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
              {t.stretchShare}: <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>15%</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
              {t.walkShare}: <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>10%</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Week Achievements Badges */}
      <section
        className={`p-4 rounded-xl shadow-sm space-y-3 border ${
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
            {t.weekAchievements}
          </h4>
          <span className="text-xs font-semibold text-blue-400">{t.viewAll12}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div
            onClick={triggerAchievementCheer}
            className={`p-3 rounded-xl flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all border ${
              isDark ? 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700' : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
            </div>
            <div className="min-w-0">
              <p
                className={`text-xs font-bold truncate ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
              >
                {t.streakMaster}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">{t.streakDesc}</p>
            </div>
          </div>

          <div
            onClick={triggerAchievementCheer}
            className={`p-3 rounded-xl flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all border ${
              isDark ? 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700' : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div className="min-w-0">
              <p
                className={`text-xs font-bold truncate ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
              >
                {t.calorieMaster}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">{t.calorieDesc}</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
