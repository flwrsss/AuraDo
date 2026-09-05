import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TaskItem, UserProfile } from '../types';
import { useTranslation } from '../translations';
import confetti from 'canvas-confetti';
import { SwipeableRow } from './SwipeableRow';

interface TasksScreenProps {
  tasks: TaskItem[];
  profile: UserProfile;
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, category: 'health' | 'fitness' | 'work' | 'recovery') => void;
  onTogglePinTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onGoToWorkout: () => void;
  onGoToCalendar?: () => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  profile,
  onToggleTask,
  onAddTask,
  onTogglePinTask,
  onDeleteTask,
  onGoToWorkout,
  onGoToCalendar,
}) => {
  const { t, format } = useTranslation(profile.language);
  const isDark = profile.theme === 'dark';

  const [activeFilter, setActiveFilter] = useState<'all' | 'morning' | 'work' | 'health' | 'fitness'>('all');
  const [selectedDay, setSelectedDay] = useState(24);
  const [newTitle, setNewTitle] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Filter and sort tasks: pinned tasks at the top
  const filteredTasks = tasks
    .filter(task => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'morning') return task.time <= '10:00';
      if (activeFilter === 'work') return task.category === 'work';
      if (activeFilter === 'health') return task.category === 'health' || task.category === 'recovery';
      if (activeFilter === 'fitness') return task.category === 'fitness';
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const completionPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const remainingCount = totalCount - completedCount;

  // SVG Circular calculation (radius 30, circumference 188.4)
  const circumference = 188.4;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  const handleCreateTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), 'health');
    setNewTitle('');
  };

  const triggerVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Голосовой ввод не поддерживается в текущем браузере.');
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = profile.language === 'ru' ? 'ru-RU' : 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setNewTitle(transcript);
        }
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleTaskCheck = (taskId: string, wasCompleted: boolean) => {
    onToggleTask(taskId);
    if (!wasCompleted) {
      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.65 },
        colors: ['#00f1fd', '#7928ca', '#dbb8ff'],
      });
    }
  };

  const weekDays = [
    { name: 'Пн', day: 23 },
    { name: 'Вт', day: 24 },
    { name: 'Ср', day: 25 },
    { name: 'Чт', day: 26 },
    { name: 'Пт', day: 27 },
    { name: 'Сб', day: 28 },
    { name: 'Вс', day: 29 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full max-w-lg mx-auto px-4 pb-28 pt-2 space-y-4"
    >
      {/* Top Status & Circular Progress Widget */}
      <section
        className={`relative overflow-hidden rounded-2xl p-5 shadow-xl transition-all duration-300 ${
          isDark
            ? 'bg-zinc-900 border border-zinc-800'
            : 'bg-white border border-zinc-200 shadow-sm'
        }`}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  isDark ? 'bg-zinc-800 text-emerald-400 border border-zinc-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.tuesday24}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                  isDark ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                }`}
              >
                <span className="material-symbols-outlined text-[14px] text-blue-400">dark_mode</span>
                {t.auraFocus}
              </span>
            </div>

            <h1
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-2xl tracking-tight ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              {t.myDay}
            </h1>

            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {completedCount} из {totalCount} {t.completedOf}
              </span>{' '}
              · {format('tasksRemaining', { count: remainingCount })}
            </p>
          </div>

          {/* Concentric Progress Ring */}
          <div className="relative flex items-center justify-center shrink-0 w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
              <circle
                className={isDark ? 'text-zinc-800' : 'text-zinc-200'}
                cx="36"
                cy="36"
                fill="none"
                r="30"
                stroke="currentColor"
                strokeWidth="5"
              />
              <circle
                className="transition-all duration-700"
                cx="36"
                cy="36"
                fill="none"
                r="30"
                stroke="url(#taskRingGradient)"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="5.5"
              />
              <defs>
                <linearGradient id="taskRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base leading-tight ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}
              >
                {completionPercent}%
              </span>
              <span className="text-[9px] font-bold tracking-widest text-blue-400 uppercase -mt-0.5">
                {t.focusTempo}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Week Calendar Strip */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-1">
          <span
            className={`font-semibold text-xs uppercase tracking-wider ${
              isDark ? 'text-zinc-500' : 'text-zinc-500'
            }`}
          >
            {new Date().toLocaleDateString(profile.language === 'ru' ? 'ru-RU' : 'en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            type="button"
            onClick={onGoToCalendar}
            className="flex items-center gap-0.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>{t.calendar}</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <div
          className={`flex items-center justify-between gap-1.5 p-1.5 rounded-2xl border ${
            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
          }`}
        >
          {weekDays.map(item => {
            const isActive = selectedDay === item.day;
            return (
              <button
                key={item.day}
                onClick={() => setSelectedDay(item.day)}
                type="button"
                className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-semibold'
                    : isDark
                    ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                    : 'text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <span className="text-[11px] font-medium opacity-80">{item.name}</span>
                <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base mt-0.5">
                  {item.day}
                </span>
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white mt-1" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-transparent mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter Pills Bar */}
      <section className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['all', 'morning', 'work', 'health', 'fitness'] as const).map(f => {
          const labels = {
            all: `${t.allFilter} (${tasks.length})`,
            morning: t.morningFilter,
            work: t.workFilter,
            health: t.healthFilter,
            fitness: t.fitnessFilter,
          };
          const isSelected = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/20'
                  : isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </section>

      {/* Interactive Task Stream */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1 text-[11px] text-zinc-400">
          <span>Свайп влево: закрепить или удалить</span>
          <span className="material-symbols-outlined text-[15px] text-blue-400">swipe_left</span>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredTasks.map(task => {
            // Check if this is the featured workout banner
            if (task.isFeaturedWorkout) {
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative overflow-hidden rounded-2xl p-5 shadow-lg border transition-all ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-800'
                      : 'bg-white border-zinc-200 shadow-sm'
                  }`}
                >
                  <div className="relative z-10 flex flex-col gap-3">
                    {/* Tags */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-900/30">
                        <span className="material-symbols-outlined text-[15px]">fitness_center</span>
                        Фитнес (+420 ккал)
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          isDark ? 'bg-zinc-800 text-emerald-400 border border-zinc-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {t.readiness100}
                      </span>
                    </div>

                    {/* Content & Studio Image */}
                    <div className="flex items-start justify-between gap-3 mt-1">
                      <div className="flex flex-col">
                        <h3
                          className={`font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg leading-snug ${
                            isDark ? 'text-zinc-100' : 'text-zinc-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          Грудь / Трицепс · 45 минут
                        </p>
                        <div
                          className={`flex items-center gap-1 text-xs mt-1.5 ${
                            isDark ? 'text-zinc-500' : 'text-zinc-500'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px] text-blue-500">
                            location_on
                          </span>
                          <span>18:30 · Клуб Аура Атлетик</span>
                        </div>
                      </div>

                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md shrink-0 border border-zinc-800">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu3Kr-XNeZWyepkNdblZtGjKOULz8AJgBpqRwzXURm462kvRSoz1H8OxU8GKGI7kSYp8m8L2Et01-G4e2DZ6Y9CVC-bV1tWGYqvovNRqyrp-lsBNs0NmB5q5kryPjsU5fVj6xuRf1Ydybty11OtdXoi64HnL69ZwEhkeks0goKK31kce1_abhlDo-_e64pp8v5Qi7V0AjOfLu7yEWVfzEIZB_Iebq403qQw3-8WvMDAulqmO7KxyVhfw"
                          alt="Gym Studio"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={onGoToWorkout}
                      type="button"
                      className="mt-1 w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <span>{t.goToWorkout}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </motion.div>
              );
            }

            // Normal Task Card with SwipeableRow
            const isCompleted = task.completed;
            return (
              <SwipeableRow
                key={task.id}
                id={task.id}
                isPinned={task.isPinned}
                onTogglePin={() => onTogglePinTask(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                pinLabel="Основная"
                unpinLabel="Открепить"
                deleteLabel="Удалить"
                isDark={isDark}
              >
                <div
                  className={`task-card relative flex items-start gap-3 p-3.5 rounded-xl transition-all duration-300 border ${
                    task.isPinned
                      ? isDark
                        ? 'bg-zinc-900 border-amber-500/50 shadow-md shadow-amber-950/10'
                        : 'bg-white border-amber-400 shadow-md'
                      : isCompleted
                      ? isDark
                        ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
                        : 'bg-zinc-100 border-zinc-200 opacity-60'
                      : isDark
                      ? 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 shadow-sm'
                      : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                  }`}
                >
                  {/* Urgent line accent if high priority and uncompleted */}
                  {task.priority === 'high' && !isCompleted && !task.isPinned && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-rose-500 rounded-l-xl" />
                  )}

                  {/* Pinned golden line accent */}
                  {task.isPinned && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-amber-400 rounded-l-xl" />
                  )}

                  {/* Checkbox button */}
                  <button
                    type="button"
                    onClick={() => handleTaskCheck(task.id, isCompleted)}
                    className={`shrink-0 mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all active:scale-90 border ${
                      isCompleted
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-900/30'
                        : isDark
                        ? 'bg-zinc-800 border-zinc-700 text-transparent hover:text-zinc-500'
                        : 'bg-zinc-100 border-zinc-300 text-transparent hover:text-zinc-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                  </button>

                  {/* Task Details */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm truncate ${
                          isCompleted
                            ? 'line-through opacity-60 font-normal'
                            : 'font-semibold text-on-surface'
                        } ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
                      >
                        {task.title}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {task.isPinned && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center gap-0.5 border border-amber-500/30">
                            <span className="material-symbols-outlined text-[12px]">push_pin</span>
                            Основная
                          </span>
                        )}

                        {task.priority === 'high' && !isCompleted && !task.isPinned && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                            {t.highPriority}
                          </span>
                        )}

                        {isCompleted && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              isDark
                                ? 'bg-zinc-800 text-zinc-400'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {t.completedBadge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-3 mt-1 text-xs ${
                        isDark ? 'text-zinc-500' : 'text-zinc-500'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {task.time}
                      </span>

                      {task.calories && (
                        <span className="flex items-center gap-1 text-blue-400 font-semibold">
                          <span className="material-symbols-outlined text-[13px]">
                            local_fire_department
                          </span>
                          +{task.calories} ккал
                        </span>
                      )}

                      {task.duration && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">timer</span>
                          {task.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </SwipeableRow>
            );
          })}

          {filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl text-center border space-y-3 ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">task_alt</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-100 font-['Plus_Jakarta_Sans',sans-serif]">
                  {tasks.length === 0 ? 'Список задач пуст' : 'Нет задач в этом фильтре'}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  {tasks.length === 0
                    ? 'Ваш день чист и свободен. Добавьте свои первые цели или тренировку через поле ниже или календарь.'
                    : 'Переключите фильтр на «Все» или создайте новую задачу.'}
                </p>
              </div>

              {tasks.length === 0 && (
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {[
                    { text: 'Утренняя зарядка 15 мин', cat: 'fitness' as const },
                    { text: 'Выпить 2л воды', cat: 'health' as const },
                    { text: 'Сфокусироваться на главном проекте', cat: 'work' as const },
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onAddTask(s.text, s.cat)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 active:scale-95 transition-all"
                    >
                      + {s.text}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Quick Add Task Input Bar */}
      <section className="flex flex-col gap-2 pt-1">
        <form
          onSubmit={handleCreateTask}
          className={`relative flex items-center rounded-xl p-1.5 pl-4 transition-all border ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 focus-within:border-blue-600'
              : 'bg-white border-zinc-300 focus-within:border-blue-600'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] text-zinc-500 mr-2">add_task</span>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder={t.quickTaskPlaceholder}
            className={`flex-1 bg-transparent text-sm focus:outline-none placeholder:text-zinc-500 ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          />

          <div className="flex items-center gap-1 pr-1">
            <button
              type="button"
              onClick={triggerVoiceInput}
              title="Голосовой ввод"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </button>

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-all disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px] font-bold">arrow_upward</span>
            </button>
          </div>
        </form>
      </section>

      {/* Theme Status Card */}
      <section
        className={`p-3.5 rounded-xl flex items-center justify-between transition-colors border ${
          isDark
            ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400'
            : 'bg-zinc-100 border-zinc-200 text-zinc-600'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[17px]">
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
          </div>
          <div className="flex flex-col text-xs">
            <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
              {isDark ? t.darkThemeStatus : t.lightThemeStatus}
            </span>
            <span className="text-[11px] text-blue-400">{t.bioRhythmEnabled}</span>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
            isDark ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {t.activeStatus}
        </span>
      </section>
    </motion.div>
  );
};
