import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  UserProfile,
  TaskItem,
  WorkoutSession,
  DailyEnergyStats,
  MainTab,
  PushNotificationPayload,
  WorkoutType,
  Intensity,
  CompletedWorkoutLog,
} from './types';
import { StorageService } from './services/storage';
import { NotificationService } from './services/notifications';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TasksScreen } from './components/TasksScreen';
import { WorkoutsScreen } from './components/WorkoutsScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { QuickCreateModal } from './components/QuickCreateModal';
import { SupportChatModal } from './components/SupportChatModal';
import { AppleAuthModal } from './components/AppleAuthModal';
import { TwoFactorModal } from './components/TwoFactorModal';
import { BroadcastModal } from './components/BroadcastModal';
import { NotificationBanner } from './components/NotificationBanner';

export default function App() {
  // Persistent States
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [tasks, setTasks] = useState<TaskItem[]>(() => StorageService.getTasks());
  const [workoutsList, setWorkoutsList] = useState<WorkoutSession[]>(() =>
    StorageService.getWorkoutsList()
  );
  const [workoutHistory, setWorkoutHistory] = useState<CompletedWorkoutLog[]>(() =>
    StorageService.getWorkoutHistory()
  );
  const [workout, setWorkout] = useState<WorkoutSession>(() => {
    const list = StorageService.getWorkoutsList();
    const pinned = list.find(w => w.isPinned);
    return pinned || StorageService.getWorkout();
  });
  const [energyStats, setEnergyStats] = useState<DailyEnergyStats[]>(() =>
    StorageService.getEnergyStats()
  );

  // Active Screen & Navigation
  const [activeTab, setActiveTab] = useState<MainTab>('tasks');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Modal States
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isAppleAuthOpen, setIsAppleAuthOpen] = useState<boolean>(false);
  const [is2FAOpen, setIs2FAOpen] = useState<boolean>(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);

  // Notification Toast
  const [activePush, setActivePush] = useState<PushNotificationPayload | null>(null);

  // Today's dynamic calories from current session
  const [todayCalories, setTodayCalories] = useState<number>(540);
  const targetCalories = 700;

  // Track Real-time Analytics Event
  const trackAnalyticsEvent = (eventName: string, params: Record<string, unknown> = {}) => {
    console.log(`[AuraDo Analytics] ${eventName}`, {
      timestamp: new Date().toISOString(),
      user: profile.handle,
      tab: activeTab,
      ...params,
    });
  };

  // Online / Offline synchronization listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      trackAnalyticsEvent('network_online_sync_resumed');
      // Drain sync queue
      const queue = StorageService.getSyncQueue();
      if (queue.length > 0) {
        setActivePush({
          id: 'sync-notif-' + Date.now(),
          title: 'Облачная синхронизация',
          body: `Синхронизировано ${queue.length} локальных изменений с Aura Cloud`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'sync',
          read: false,
        });
        StorageService.clearSyncQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      trackAnalyticsEvent('network_offline_local_storage');
      setActivePush({
        id: 'offline-notif-' + Date.now(),
        title: 'Офлайн-режим активирован',
        body: 'Данные сохраняются локально и синхронизируются при подключении к сети.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'offline',
        read: false,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [profile.handle, activeTab]);

  // Apply Theme to document element & body
  useEffect(() => {
    const root = document.documentElement;
    if (profile.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.style.backgroundColor = '#09090b';
      document.body.style.color = '#f4f4f5';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.style.backgroundColor = '#fafafa';
      document.body.style.color = '#18181b';
    }
  }, [profile.theme]);

  // Handle Task Toggle
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    StorageService.saveTasks(updated);

    const targetTask = tasks.find(t => t.id === taskId);
    trackAnalyticsEvent('task_toggled', {
      taskId,
      title: targetTask?.title,
      completed: !targetTask?.completed,
    });
  };

  // Handle Add Task
  const handleAddTask = (title: string, category: 'health' | 'fitness' | 'work' | 'recovery') => {
    const newTask: TaskItem = {
      id: 'task-' + Date.now(),
      title,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category,
      completed: false,
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    StorageService.saveTasks(updated);
    trackAnalyticsEvent('task_created', { title, category });
  };

  // Toggle Pin Task
  const handleTogglePinTask = (taskId: string) => {
    const updated = tasks.map(t => (t.id === taskId ? { ...t, isPinned: !t.isPinned } : t));
    setTasks(updated);
    StorageService.saveTasks(updated);
    const target = updated.find(t => t.id === taskId);
    setActivePush({
      id: 'pin-t-' + Date.now(),
      title: target?.isPinned ? 'Задача закреплена' : 'Задача откреплена',
      body: `«${target?.title}» ${target?.isPinned ? 'закреплена вверху как основная.' : 'снята с закрепления.'}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'task',
      read: false,
    });
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    StorageService.saveTasks(updated);
    setActivePush({
      id: 'del-t-' + Date.now(),
      title: 'Задача удалена',
      body: `«${target?.title || ''}» удалена из списка задач.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'task',
      read: false,
    });
  };

  // Handle Update Workout
  const handleUpdateWorkout = (updated: WorkoutSession) => {
    setWorkout(updated);
    StorageService.saveWorkout(updated);
    // Also update in list
    const updatedList = workoutsList.map(w => (w.id === updated.id ? updated : w));
    setWorkoutsList(updatedList);
    StorageService.saveWorkoutsList(updatedList);
    trackAnalyticsEvent('workout_progress_updated', { title: updated.title });
  };

  // Select Active Workout & Pin
  const handleSelectActiveWorkout = (selected: WorkoutSession) => {
    const updatedList = workoutsList.map(w => ({
      ...w,
      isPinned: w.id === selected.id,
    }));
    setWorkoutsList(updatedList);
    StorageService.saveWorkoutsList(updatedList);

    const pinnedWorkout = { ...selected, isPinned: true };
    setWorkout(pinnedWorkout);
    StorageService.saveWorkout(pinnedWorkout);

    setActivePush({
      id: 'pin-w-' + Date.now(),
      title: 'Основная тренировка выбрана',
      body: `«${selected.title}» назначена как основная на сегодня.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'workout',
      read: false,
    });
  };

  // Add Custom Workout
  const handleAddCustomWorkout = (newWorkout: WorkoutSession) => {
    const updatedList = [newWorkout, ...workoutsList];
    setWorkoutsList(updatedList);
    StorageService.saveWorkoutsList(updatedList);

    if (newWorkout.isPinned) {
      setWorkout(newWorkout);
      StorageService.saveWorkout(newWorkout);
    }

    setActivePush({
      id: 'add-w-' + Date.now(),
      title: 'План тренировки сохранен',
      body: `«${newWorkout.title}» добавлена в ваши тренировки.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'workout',
      read: false,
    });
  };

  // Delete Workout
  const handleDeleteWorkout = (workoutId: string) => {
    const target = workoutsList.find(w => w.id === workoutId);
    const updatedList = workoutsList.filter(w => w.id !== workoutId);
    setWorkoutsList(updatedList);
    StorageService.saveWorkoutsList(updatedList);

    if (workout.id === workoutId && updatedList.length > 0) {
      const fallback = updatedList[0];
      setWorkout(fallback);
      StorageService.saveWorkout(fallback);
    }

    setActivePush({
      id: 'del-w-' + Date.now(),
      title: 'Тренировка удалена',
      body: `«${target?.title || ''}» удалена.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'workout',
      read: false,
    });
  };

  // Complete Workout & Record in History
  const handleCompleteWorkout = (summary: {
    workout: WorkoutSession;
    caloriesBurned: number;
    durationMinutes: number;
  }) => {
    handleAddCalories(summary.caloriesBurned);

    const log: CompletedWorkoutLog = {
      id: 'hist-' + Date.now(),
      title: summary.workout.title,
      type: summary.workout.type,
      muscleGroup: summary.workout.muscleGroup,
      completedAt: 'Сегодня, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      durationMinutes: summary.durationMinutes,
      caloriesBurned: summary.caloriesBurned,
      exercisesCount: summary.workout.exercises.length,
      exercisesSummary: summary.workout.exercises.map(
        e => `${e.name} (${e.completedSets}/${e.sets})`
      ),
    };

    const updatedHistory = [log, ...workoutHistory];
    setWorkoutHistory(updatedHistory);
    StorageService.saveWorkoutHistory(updatedHistory);

    const completedSession: WorkoutSession = {
      ...summary.workout,
      status: 'completed',
    };
    handleUpdateWorkout(completedSession);

    const updatedProfile: UserProfile = {
      ...profile,
      totalCaloriesBurned: (profile.totalCaloriesBurned || 14200) + summary.caloriesBurned,
      completionRate: Math.min(100, (profile.completionRate || 88) + 1),
    };
    handleUpdateProfile(updatedProfile);

    setActivePush({
      id: 'finish-w-' + Date.now(),
      title: 'Тренировка завершена! 🔥',
      body: `Сожжено ${summary.caloriesBurned} ккал за ${summary.durationMinutes} мин. Сохранено в истории.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'workout',
      read: false,
    });
  };

  // Handle Add Calories to today's burn
  const handleAddCalories = (cals: number) => {
    setTodayCalories(prev => prev + cals);
    // Also update Tuesday (today index 1) in weekly stats
    const updatedStats = energyStats.map((s, idx) => {
      if (idx === 1) {
        const nextCals = s.calories + cals;
        return {
          ...s,
          calories: nextCals,
          metGoal: nextCals >= targetCalories,
        };
      }
      return s;
    });
    setEnergyStats(updatedStats);
    StorageService.saveEnergyStats(updatedStats);
    trackAnalyticsEvent('calories_added', { calories: cals });
  };

  // Handle Update Profile
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    StorageService.saveProfile(updated);
    trackAnalyticsEvent('profile_updated', {
      theme: updated.theme,
      language: updated.language,
      bioSync: updated.bioRhythmSyncActive,
    });
  };

  // Handle complete data reset (clean slate requested by user)
  const handleResetAllData = () => {
    StorageService.clearAllUserData();
    setTasks([]);
    setWorkoutsList([]);
    setWorkoutHistory([]);
    setWorkout({
      id: '',
      title: '',
      type: 'Гибридная',
      durationMinutes: 45,
      caloriesEstimate: 350,
      muscleGroup: 'Все тело',
      image: '',
      exercises: [],
    });
    setTodayCalories(0);
    setActivePush({
      id: 'reset-' + Date.now(),
      title: 'Данные очищены',
      body: 'Приложение сброшено до чистого состояния и готово к работе.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'system',
    });
  };

  // Handle Quick Create from Modal
  const handleCreateFromModal = (data: {
    type: 'workout' | 'reminder';
    workoutType: WorkoutType;
    duration: number;
    intensity: Intensity;
    calories: number;
    title: string;
    checklist: string[];
    notifyBefore: boolean;
  }) => {
    if (data.type === 'workout') {
      // Add as top workout task
      const newWorkoutTask: TaskItem = {
        id: 'task-w-' + Date.now(),
        title: data.title,
        time: '19:00',
        category: 'fitness',
        completed: false,
        calories: data.calories,
        duration: `${data.duration} мин`,
        isFeaturedWorkout: true,
      };
      const updated = [newWorkoutTask, ...tasks];
      setTasks(updated);
      StorageService.saveTasks(updated);
    } else {
      handleAddTask(data.title, 'health');
    }

    // Schedule / show instant push confirmation if requested
    if (data.notifyBefore) {
      const notif = NotificationService.sendPush(
        'Сессия запланирована',
        `Синхронизировано: ${data.title} (~${data.calories} ккал). Напоминание придет за 15 мин.`
      );
      setActivePush(notif);
    }

    trackAnalyticsEvent('quick_create_completed', data);
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = profile.theme === 'dark' ? 'light' : 'dark';
    handleUpdateProfile({ ...profile, theme: nextTheme });
  };

  // Toggle Language
  const handleToggleLanguage = () => {
    const nextLang = profile.language === 'ru' ? 'en' : 'ru';
    handleUpdateProfile({ ...profile, language: nextLang });
  };

  // Handle Apple ID Login
  const handleSuccessAppleAuth = (email: string) => {
    handleUpdateProfile({
      ...profile,
      email,
      isPro: true,
    });
    setActivePush({
      id: 'auth-' + Date.now(),
      title: 'Apple ID Авторизован',
      body: `Связано с аккаунтом ${email}. Данные защищены iCloud Keychain.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'security',
      read: false,
    });
    trackAnalyticsEvent('apple_id_authenticated');
  };

  // Handle Push Dispatch from Broadcast API
  const handleDispatchPush = (title: string, body: string, category: string) => {
    const notif = NotificationService.sendPush(title, body, category);
    setActivePush(notif);
    trackAnalyticsEvent('broadcast_push_triggered', { title, category });
  };

  const isDark = profile.theme === 'dark';

  return (
    <div
      id="aurado-app-container"
      className={`min-h-screen w-full flex flex-col relative transition-colors duration-300 font-['Inter',sans-serif] ${
        isDark
          ? 'bg-zinc-950 text-zinc-100'
          : 'bg-zinc-50 text-zinc-900'
      }`}
    >
      {/* Push Notification Floating Banner */}
      <NotificationBanner
        notification={activePush}
        onDismiss={() => setActivePush(null)}
      />

      {/* Main Header */}
      <Header
        profile={profile}
        activeTab={activeTab}
        isOnline={isOnline}
        onProfileClick={() => {
          setActiveTab('profile');
          trackAnalyticsEvent('navigation_tab_changed', { tab: 'profile' });
        }}
        onToggleTheme={handleToggleTheme}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Screen Content Viewport */}
      <main className="flex-1 w-full pt-16 sm:pt-20">
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && (
            <TasksScreen
              key="tasks"
              tasks={tasks}
              profile={profile}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onTogglePinTask={handleTogglePinTask}
              onDeleteTask={handleDeleteTask}
              onGoToWorkout={() => {
                setActiveTab('workouts');
                trackAnalyticsEvent('navigation_tab_changed', { tab: 'workouts' });
              }}
              onGoToCalendar={() => {
                setActiveTab('calendar');
                trackAnalyticsEvent('navigation_tab_changed', { tab: 'calendar' });
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarScreen
              key="calendar"
              tasks={tasks}
              workoutsList={workoutsList}
              profile={profile}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onSelectActiveWorkout={handleSelectActiveWorkout}
            />
          )}

          {activeTab === 'workouts' && (
            <WorkoutsScreen
              key="workouts"
              workout={workout}
              workoutsList={workoutsList}
              workoutHistory={workoutHistory}
              profile={profile}
              onUpdateWorkout={handleUpdateWorkout}
              onSelectActiveWorkout={handleSelectActiveWorkout}
              onAddCustomWorkout={handleAddCustomWorkout}
              onDeleteWorkout={handleDeleteWorkout}
              onCompleteWorkout={handleCompleteWorkout}
              onAddCalories={handleAddCalories}
              todayCalories={todayCalories}
              targetCalories={targetCalories}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsScreen
              key="analytics"
              energyStats={energyStats}
              tasks={tasks}
              workout={workout}
              profile={profile}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileScreen
              key="profile"
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onOpen2FA={() => setIs2FAOpen(true)}
              onOpenSupport={() => setIsSupportOpen(true)}
              onOpenBroadcast={() => setIsBroadcastOpen(true)}
              onAppleSignIn={() => setIsAppleAuthOpen(true)}
              onResetAllData={handleResetAllData}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          trackAnalyticsEvent('navigation_tab_changed', { tab });
        }}
        onQuickCreate={() => setIsQuickCreateOpen(true)}
        theme={profile.theme}
        language={profile.language}
      />

      {/* Quick Create Modal */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        profile={profile}
        onCreateWorkoutOrTask={handleCreateFromModal}
      />

      {/* Technical Support Chat Modal */}
      <SupportChatModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        profile={profile}
      />

      {/* Apple ID Auth Modal */}
      <AppleAuthModal
        isOpen={isAppleAuthOpen}
        onClose={() => setIsAppleAuthOpen(false)}
        profile={profile}
        onSuccessAuth={handleSuccessAppleAuth}
      />

      {/* 2FA Security Modal */}
      <TwoFactorModal
        isOpen={is2FAOpen}
        onClose={() => setIs2FAOpen(false)}
        profile={profile}
        onToggle2FA={enabled => {
          handleUpdateProfile({ ...profile, twoFactorEnabled: enabled });
        }}
      />

      {/* Automated Broadcast API Manager Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        profile={profile}
        onDispatchPush={handleDispatchPush}
      />
    </div>
  );
}
