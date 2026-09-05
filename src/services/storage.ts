import { TaskItem, WorkoutSession, UserProfile, DailyEnergyStats, PushNotificationPayload } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'aurado_user_profile_v1',
  TASKS: 'aurado_tasks_v1',
  WORKOUT: 'aurado_workout_v1',
  ENERGY: 'aurado_energy_v1',
  NOTIFICATIONS: 'aurado_notifications_v1',
  OFFLINE_QUEUE: 'aurado_sync_queue_v1',
};

// Initial User matching the UI screenshot exactly
export const initialProfile: UserProfile = {
  name: 'Елена Ростова',
  handle: '@elena_aura',
  email: 'elena.rostova@aura.do',
  avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1X9-bfTBRby8_asgJ-Jq46iaVl5HZrIMKtThwfD62DCmKEGHP41DmINFW3n-X-iMOtLPzRPh-csVyJ2qVnw1BY-t9nc_3fyygrRY7Ryi7XGV4lUEiZ6Po8a8QhLH-adidvxJLaeolUeQACl0bRbbcH-OyT8aGs9_MMZHgHbRIH9qYGqHJpU5-kFzkFc_5pgGoHvK9q9snWsUTqleqq41yRpSmVoIipxC5zxS0U5XenXSCGojReT6ej-sdpQ',
  isPro: true,
  focusDaysStreak: 14,
  totalCaloriesBurned: 18450,
  completionRate: 92,
  bioRhythmSyncActive: true,
  appleHealthSynced: true,
  appleWatchConnected: true,
  twoFactorEnabled: true,
  language: 'ru',
  theme: 'dark', // default dark, user can toggle to light pearlescent
  deliveryStyle: 'soft',
  quietHours: {
    start: '22:30',
    end: '07:30',
    durationLabel: '9ч отдыха',
  },
  notifications: {
    workouts: true,
    bioSync: true,
    deadlines: true,
    hydration: true,
  },
};

export const initialTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Принять витамины и омега-3',
    time: '08:30',
    category: 'health',
    completed: true,
  },
  {
    id: 'task-2',
    title: 'Утренняя разминка 15 мин',
    time: '09:00',
    category: 'fitness',
    completed: true,
    calories: 95,
  },
  {
    id: 'task-3',
    title: 'Сдать отчет по спринту',
    time: '12:00',
    category: 'work',
    completed: false,
    priority: 'high',
  },
  {
    id: 'task-4',
    title: 'Силовая тренировка',
    time: '18:30',
    category: 'fitness',
    completed: false,
    calories: 420,
    duration: '45 минут',
    isFeaturedWorkout: true,
  },
  {
    id: 'task-5',
    title: 'Вечерняя прогулка и медитация',
    time: '21:00',
    category: 'recovery',
    completed: false,
    duration: '30 мин',
  },
];

export const initialWorkout: WorkoutSession = {
  id: 'workout-today',
  title: 'Интенсивная силовая тренировка',
  muscleGroup: 'Грудь и Трицепс',
  type: 'Силовая',
  caloriesEstimate: 480,
  durationMinutes: 45,
  exerciseCount: 5,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLMWNcjcAqLfzOaHpoaQX93C0Dn75vvbnJk7aRFpLWQasr56zwFIbxeO3blx_etrAleRriCUf9ojdxD0dYdFlYMvzQ8n_UGFR_kXJsD1MSENuBlx9xBCBMnJrJzEo4BiOsk2_ZyziQDAxrJC60kD-eyCxiPIJyni4ApkipH0gXG7D8Ff9PTJNKkY7Ll41xkevLVyc3rYoZxF6jFO28qemQyhQqm4CusOdBHQQVsvUMeh-B3tFLnKM5jQ',
  exercises: [
    {
      id: 'ex-1',
      name: 'Жим штанги лежа',
      sets: 4,
      reps: 10,
      completedSets: 4,
      calories: 140,
    },
    {
      id: 'ex-2',
      name: 'Разведение гантелей на наклонной',
      sets: 3,
      reps: 12,
      completedSets: 3,
      calories: 95,
    },
    {
      id: 'ex-3',
      name: 'Отжимания на брусьях',
      sets: 3,
      reps: 12,
      completedSets: 2, // 2/3 done
      calories: 85,
      active: true,
    },
    {
      id: 'ex-4',
      name: 'Французский жим',
      sets: 3,
      reps: 15,
      completedSets: 0,
      calories: 70,
    },
    {
      id: 'ex-5',
      name: 'Заминка на дорожке',
      sets: 1,
      reps: 10,
      completedSets: 0,
      calories: 90,
    },
  ],
};

export const initialEnergyStats: DailyEnergyStats[] = [
  { day: 'Пн', dateStr: '23.10', calories: 640, target: 700, metGoal: false },
  { day: 'Вт', dateStr: '24.10', calories: 780, target: 700, metGoal: true },
  { day: 'Ср', dateStr: '25.10', calories: 520, target: 700, metGoal: false },
  { day: 'Чт', dateStr: '26.10', calories: 920, target: 700, metGoal: true },
  { day: 'Пт', dateStr: '27.10', calories: 710, target: 700, metGoal: true },
  { day: 'Сб', dateStr: '28.10', calories: 750, target: 700, metGoal: true },
  { day: 'Вс', dateStr: '29.10', calories: 320, target: 700, metGoal: false },
];

export const initialNotifications: PushNotificationPayload[] = [
  {
    id: 'notif-1',
    title: 'Био-синхронизация AuraDo',
    body: 'Пик продуктивности начнется через 15 минут (18:30). Рекомендуем силовую сессию.',
    time: '18:15',
    category: 'bio-sync',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Гидратация & Нутриенты',
    body: 'Не забудьте принять 0.75л воды с электролитами перед тренировкой.',
    time: '17:45',
    category: 'hydration',
    read: true,
  },
  {
    id: 'notif-3',
    title: 'Серия фокуса продлена!',
    body: 'Поздравляем! 14 дней активного био-ритма зафиксировано.',
    time: '14:00',
    category: 'achievements',
    read: true,
  },
];

export const StorageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : initialProfile;
    } catch {
      return initialProfile;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      this.recordSyncAction('update_profile', profile);
    } catch (e) {
      console.warn('Storage saveProfile error:', e);
    }
  },

  getTasks(): TaskItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : initialTasks;
    } catch {
      return initialTasks;
    }
  },

  saveTasks(tasks: TaskItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      this.recordSyncAction('update_tasks', tasks);
    } catch (e) {
      console.warn('Storage saveTasks error:', e);
    }
  },

  getWorkout(): WorkoutSession {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUT);
      return data ? JSON.parse(data) : initialWorkout;
    } catch {
      return initialWorkout;
    }
  },

  saveWorkout(workout: WorkoutSession): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUT, JSON.stringify(workout));
      this.recordSyncAction('update_workout', workout);
    } catch (e) {
      console.warn('Storage saveWorkout error:', e);
    }
  },

  getEnergyStats(): DailyEnergyStats[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENERGY);
      return data ? JSON.parse(data) : initialEnergyStats;
    } catch {
      return initialEnergyStats;
    }
  },

  saveEnergyStats(stats: DailyEnergyStats[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ENERGY, JSON.stringify(stats));
      this.recordSyncAction('update_energy', stats);
    } catch (e) {
      console.warn('Storage saveEnergyStats error:', e);
    }
  },

  getNotifications(): PushNotificationPayload[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  },

  saveNotifications(notifs: PushNotificationPayload[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch (e) {
      console.warn('Storage saveNotifications error:', e);
    }
  },

  // Offline Sync Queue
  recordSyncAction(action: string, payload: unknown) {
    try {
      const queue = this.getSyncQueue();
      queue.push({
        id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        action,
        payload,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue.slice(-50)));
    } catch (e) {
      console.warn('Sync queue error:', e);
    }
  },

  getSyncQueue() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  clearSyncQueue() {
    try {
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    } catch (e) {
      console.warn('Clear sync queue error:', e);
    }
  },

  // Export to CSV
  exportToCSV(energyStats: DailyEnergyStats[], tasks: TaskItem[], workout: WorkoutSession): void {
    const rows = [
      ['AuraDo Biometrics & Activity Report'],
      ['Generated Date', new Date().toLocaleDateString('ru-RU')],
      [],
      ['1. WEEKLY ENERGY EXPENDITURE (KCAL)'],
      ['Day', 'Date', 'Calories Burned', 'Target (kcal)', 'Goal Met'],
      ...energyStats.map(stat => [stat.day, stat.dateStr, stat.calories, stat.target, stat.metGoal ? 'YES' : 'NO']),
      [],
      ['2. TASKS OVERVIEW'],
      ['Time', 'Title', 'Category', 'Completed', 'Calories'],
      ...tasks.map(t => [t.time, `"${t.title}"`, t.category, t.completed ? 'Completed' : 'Pending', t.calories || 0]),
      [],
      ['3. CURRENT WORKOUT SESSION'],
      ['Exercise', 'Sets Goal', 'Completed Sets', 'Reps', 'Calories'],
      ...workout.exercises.map(e => [`"${e.name}"`, e.sets, e.completedSets, e.reps, e.calories]),
    ];

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AuraDo_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Generate Printable PDF View
  exportToPDF(energyStats: DailyEnergyStats[], tasks: TaskItem[], workout: WorkoutSession, profile: UserProfile): void {
    const totalWeeklyCals = energyStats.reduce((acc, curr) => acc + curr.calories, 0);
    const completedTasks = tasks.filter(t => t.completed).length;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Пожалуйста, разрешите всплывающие окна для экспорта отчета.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AuraDo - Biometric Report (${new Date().toLocaleDateString('ru-RU')})</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #10131a;
            background: #fff;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #7928ca;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 26px;
            font-weight: 800;
            color: #7928ca;
            letter-spacing: -0.02em;
          }
          .badge {
            background: #f3e8ff;
            color: #7928ca;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
          }
          .stat-val {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
          }
          .stat-lbl {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
          }
          h2 {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            margin-top: 25px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 14px;
          }
          th, td {
            text-align: left;
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
          }
          th {
            background: #f8fafc;
            font-weight: 600;
            color: #475569;
          }
          .tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            background: #e2e8f0;
          }
          .tag-done {
            background: #dcfce7;
            color: #15803d;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #94a3b8;
          }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">AuraDo</div>
            <div style="font-size: 14px; color: #64748b; margin-top: 4px;">Био-ритмы, задачи и тренировки</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">PRO MEMBER</div>
            <div style="font-size: 13px; color: #475569; margin-top: 6px;">${profile.name} (${profile.handle})</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-val">${totalWeeklyCals.toLocaleString()} ккал</div>
            <div class="stat-lbl">Сожжено за неделю</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${completedTasks} / ${tasks.length}</div>
            <div class="stat-lbl">Задач завершено</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${profile.focusDaysStreak} дней</div>
            <div class="stat-lbl">Серия био-фокуса</div>
          </div>
        </div>

        <h2>Расход энергии по дням недели</h2>
        <table>
          <thead>
            <tr>
              <th>День</th>
              <th>Дата</th>
              <th>Сожжено (ккал)</th>
              <th>Цель</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            ${energyStats.map(s => `
              <tr>
                <td><strong>${s.day}</strong></td>
                <td>${s.dateStr}</td>
                <td>${s.calories} ккал</td>
                <td>${s.target} ккал</td>
                <td>${s.metGoal ? '<span class="tag tag-done">Цель выполнена</span>' : '<span class="tag">В процессе</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>План упражнений: ${workout.title}</h2>
        <table>
          <thead>
            <tr>
              <th>Упражнение</th>
              <th>Подходы</th>
              <th>Повторы</th>
              <th>Расход</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            ${workout.exercises.map(e => `
              <tr>
                <td><strong>${e.name}</strong></td>
                <td>${e.completedSets} / ${e.sets}</td>
                <td>${e.reps} повт</td>
                <td>${e.calories} ккал</td>
                <td>${e.completedSets >= e.sets ? '<span class="tag tag-done">Завершено</span>' : '<span class="tag">В работе</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>AuraDo v2.4.0 (Build 890) • End-to-End Encrypted HealthKit Data</div>
          <div>Экспортировано: ${new Date().toLocaleString('ru-RU')}</div>
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="background: #7928ca; color: white; border: none; padding: 12px 28px; border-radius: 9999px; font-weight: 700; font-size: 15px; cursor: pointer;">
            Печать / Сохранить в PDF
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};
