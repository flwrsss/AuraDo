export type ThemeMode = 'dark' | 'light';
export type Language = 'ru' | 'en';
export type DeliveryStyle = 'soft' | 'haptic' | 'banner';
export type MainTab = 'tasks' | 'workouts' | 'analytics' | 'profile';
export type WorkoutType = 'strength' | 'cardio' | 'hiit' | 'yoga' | 'swim';
export type Intensity = 'light' | 'medium' | 'high';

export interface TaskItem {
  id: string;
  title: string;
  time: string;
  category: 'health' | 'fitness' | 'work' | 'recovery';
  completed: boolean;
  priority?: 'normal' | 'high';
  calories?: number;
  duration?: string;
  isFeaturedWorkout?: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: number;
  completedSets: number;
  calories: number;
  active?: boolean;
}

export interface WorkoutSession {
  id: string;
  title: string;
  muscleGroup: string;
  type: string;
  caloriesEstimate: number;
  durationMinutes: number;
  exerciseCount: number;
  exercises: ExerciseItem[];
  image: string;
}

export interface DailyEnergyStats {
  day: string;
  dateStr: string;
  calories: number;
  target: number;
  metGoal: boolean;
}

export interface UserProfile {
  name: string;
  handle: string;
  email: string;
  avatarUrl: string;
  isPro: boolean;
  focusDaysStreak: number;
  totalCaloriesBurned: number;
  completionRate: number;
  bioRhythmSyncActive: boolean;
  appleHealthSynced: boolean;
  appleWatchConnected: boolean;
  twoFactorEnabled: boolean;
  language: Language;
  theme: ThemeMode;
  deliveryStyle: DeliveryStyle;
  quietHours: {
    start: string;
    end: string;
    durationLabel: string;
  };
  notifications: {
    workouts: boolean;
    bioSync: boolean;
    deadlines: boolean;
    hydration: boolean;
  };
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'support' | 'system';
  text: string;
  timestamp: string;
}

export interface PushNotificationPayload {
  id: string;
  title: string;
  body: string;
  time: string;
  category: string;
  read: boolean;
}
