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
} from './types';
import { StorageService } from './services/storage';
import { NotificationService } from './services/notifications';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TasksScreen } from './components/TasksScreen';
import { WorkoutsScreen } from './components/WorkoutsScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { ProfileScreen } from './components/ProfileScreen';
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
  const [workout, setWorkout] = useState<WorkoutSession>(() => StorageService.getWorkout());
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

  // Handle Update Workout
  const handleUpdateWorkout = (updated: WorkoutSession) => {
    setWorkout(updated);
    StorageService.saveWorkout(updated);
    trackAnalyticsEvent('workout_progress_updated', { title: updated.title });
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
              onGoToWorkout={() => {
                setActiveTab('workouts');
                trackAnalyticsEvent('navigation_tab_changed', { tab: 'workouts' });
              }}
            />
          )}

          {activeTab === 'workouts' && (
            <WorkoutsScreen
              key="workouts"
              workout={workout}
              profile={profile}
              onUpdateWorkout={handleUpdateWorkout}
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
