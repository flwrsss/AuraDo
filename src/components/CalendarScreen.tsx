import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TaskItem, WorkoutSession, UserProfile } from '../types';
import { SwipeableRow } from './SwipeableRow';

interface CalendarScreenProps {
  tasks: TaskItem[];
  workoutsList: WorkoutSession[];
  profile: UserProfile;
  onToggleTask: (taskId: string) => void;
  onAddTaskToDate: (title: string, dateStr: string, time: string, category: 'health' | 'fitness' | 'work' | 'recovery') => void;
  onDeleteTask: (taskId: string) => void;
  onSelectWorkout: (workout: WorkoutSession) => void;
  onGoToWorkoutsTab: () => void;
}

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  tasks,
  workoutsList,
  profile,
  onToggleTask,
  onAddTaskToDate,
  onDeleteTask,
  onSelectWorkout,
  onGoToWorkoutsTab,
}) => {
  const isDark = profile.theme === 'dark';

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  // New task inline input state for selected date
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('10:00');
  const [newTaskCategory, setNewTaskCategory] = useState<'health' | 'fitness' | 'work' | 'recovery'>('work');

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  // Days in month calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  // Monday is 0 in Russia: (getDay() + 6) % 7
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Tasks for selected date
  // A task matches if task.date === selectedDateStr, OR if task has no date and selectedDateStr === today's ISO
  const todayISO = today.toISOString().split('T')[0];
  const selectedDayTasks = tasks.filter(t => {
    if (t.date) return t.date === selectedDateStr;
    return selectedDateStr === todayISO;
  });

  // Calendar dates with indicators
  const hasTasksOnDate = (dateStr: string) => {
    return tasks.some(t => (t.date ? t.date === dateStr : dateStr === todayISO));
  };

  const hasPendingTasksOnDate = (dateStr: string) => {
    return tasks.some(t => !t.completed && (t.date ? t.date === dateStr : dateStr === todayISO));
  };

  const hasDoneTasksOnDate = (dateStr: string) => {
    return tasks.some(t => t.completed && (t.date ? t.date === dateStr : dateStr === todayISO));
  };

  // Submit new task for selected date
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTaskToDate(newTaskTitle.trim(), selectedDateStr, newTaskTime, newTaskCategory);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  // Format selected date display header (e.g. "Сб, 5 сентября")
  const selectedDateObj = new Date(selectedDateStr + 'T00:00:00');
  const formattedSelectedDate = selectedDateObj.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full max-w-lg mx-auto px-4 pb-28 pt-2 space-y-4"
    >
      {/* Calendar Card Container */}
      <section
        className={`rounded-2xl p-4 sm:p-5 shadow-lg border transition-all ${
          isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}
      >
        {/* Month Header & Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg sm:text-xl">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            {selectedDateStr !== todayISO && (
              <button
                onClick={handleGoToToday}
                type="button"
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
              >
                Сегодня
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              type="button"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700'
              }`}
              title="Предыдущий месяц"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              onClick={handleNextMonth}
              type="button"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700'
              }`}
              title="Следующий месяц"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAYS_OF_WEEK.map((d, i) => (
            <span
              key={d}
              className={`text-xs font-semibold ${
                i >= 5 ? 'text-amber-500/80' : 'text-zinc-400'
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before start of month */}
          {Array.from({ length: startDayOffset }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-10 w-full" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const monthStr = String(currentMonth + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const cellDateStr = `${currentYear}-${monthStr}-${dayStr}`;

            const isToday = cellDateStr === todayISO;
            const isSelected = cellDateStr === selectedDateStr;
            const hasPending = hasPendingTasksOnDate(cellDateStr);
            const hasDone = hasDoneTasksOnDate(cellDateStr);

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDateStr(cellDateStr)}
                className={`relative h-10 w-full rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all active:scale-90 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold scale-105 z-10'
                    : isToday
                    ? isDark
                      ? 'bg-zinc-800 text-blue-400 border border-blue-500/40'
                      : 'bg-blue-50 text-blue-600 border border-blue-300'
                    : isDark
                    ? 'hover:bg-zinc-800/80 text-zinc-300'
                    : 'hover:bg-zinc-100 text-zinc-800'
                }`}
              >
                <span>{dayNum}</span>

                {/* Status Dot */}
                <div className="flex gap-0.5 mt-0.5">
                  {hasPending && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-blue-400'
                      }`}
                    />
                  )}
                  {hasDone && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-emerald-300' : 'bg-emerald-400'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Day Overview & Tasks List */}
      <section
        className={`rounded-2xl p-4 sm:p-5 shadow-lg border transition-all space-y-4 ${
          isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}
      >
        {/* Day Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base capitalize">
                {formattedSelectedDate}
              </h3>
              {selectedDateStr === todayISO && (
                <span className="px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                  Сегодня
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {selectedDayTasks.length > 0
                ? `Задач: ${selectedDayTasks.filter(t => t.completed).length} из ${selectedDayTasks.length} выполнено`
                : 'Свободный день в расписании'}
            </p>
          </div>

          <button
            onClick={() => setIsAddingTask(prev => !prev)}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-900/20 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isAddingTask ? 'close' : 'add'}
            </span>
            <span>{isAddingTask ? 'Отмена' : 'Задача'}</span>
          </button>
        </div>

        {/* Quick Add Task Form */}
        <AnimatePresence>
          {isAddingTask && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateTask}
              className={`p-3.5 rounded-xl border space-y-3 ${
                isDark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Что запланировать на этот день?"
                  className={`flex-1 h-9 px-3 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                />
                <input
                  type="time"
                  value={newTaskTime}
                  onChange={e => setNewTaskTime(e.target.value)}
                  className={`h-9 px-2 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Categories */}
                <div className="flex gap-1.5 flex-wrap">
                  {(['health', 'fitness', 'work', 'recovery'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewTaskCategory(cat)}
                      className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all ${
                        newTaskCategory === cat
                          ? 'bg-blue-600 text-white border-blue-500'
                          : isDark
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          : 'bg-white border-zinc-200 text-zinc-600'
                      }`}
                    >
                      {cat === 'health'
                        ? 'Здоровье'
                        : cat === 'fitness'
                        ? 'Фитнес'
                        : cat === 'work'
                        ? 'Работа'
                        : 'Отдых'}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow active:scale-95"
                >
                  Добавить
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Tasks List */}
        <div className="space-y-2">
          {selectedDayTasks.length > 0 ? (
            selectedDayTasks.map(task => (
              <SwipeableRow
                key={task.id}
                itemId={task.id}
                isPinned={task.isPinned}
                theme={profile.theme}
                onTogglePin={() => {}}
                onDelete={() => onDeleteTask(task.id)}
              >
                <div
                  onClick={() => onToggleTask(task.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    task.completed
                      ? isDark
                        ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
                        : 'bg-zinc-50 border-zinc-200 opacity-60'
                      : isDark
                      ? 'bg-zinc-800/80 border-zinc-700/70 hover:border-zinc-600'
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-zinc-500 hover:border-blue-400'
                      }`}
                    >
                      {task.completed && (
                        <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                      )}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          task.completed
                            ? 'line-through text-zinc-500'
                            : isDark
                            ? 'text-zinc-100'
                            : 'text-zinc-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          {task.time}
                        </span>
                        <span className="capitalize">{task.category}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </SwipeableRow>
            ))
          ) : (
            <div className="text-center py-6 px-4 rounded-xl border border-dashed border-zinc-800/80 space-y-2">
              <span className="material-symbols-outlined text-[32px] text-zinc-600">
                event_available
              </span>
              <p className="text-xs font-semibold text-zinc-400">
                На {formattedSelectedDate} задач пока нет
              </p>
              <button
                type="button"
                onClick={() => setIsAddingTask(true)}
                className="text-xs text-blue-400 hover:underline font-semibold"
              >
                + Запланировать задачу на эту дату
              </button>
            </div>
          )}
        </div>

        {/* Circadian Energy Curve Forecast */}
        <div
          className={`p-3.5 rounded-xl border space-y-2 ${
            isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 text-blue-400">
              <span className="material-symbols-outlined text-[16px]">insights</span>
              Био-ритм на этот день
            </span>
            <span className="text-[10px] text-zinc-400">Пик фокуса: 10:00 и 18:30</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Оптимальное окно для спортивных и аналитических нагрузок приходится на утренние и вечерние часы. Рекомендуется планировать силовые тренировки с 18:00 до 20:00.
          </p>
        </div>
      </section>
    </motion.div>
  );
};
