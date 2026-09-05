export type ThemeMode = 'dark' | 'light';
export type Language = 'ru' | 'en';
export type DeliveryStyle = 'soft' | 'haptic' | 'banner';
export type MainTab = 'tasks' | 'calendar' | 'workouts' | 'analytics' | 'profile';
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
  isPinned?: boolean;
  date?: string; // YYYY-MM-DD
}

export interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: number;
  completedSets: number;
  calories: number;
  active?: boolean;
  weightKg?: number;
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
  isPinned?: boolean;
  createdAt?: string;
  status?: 'planned' | 'in_progress' | 'completed';
}

export interface CompletedWorkoutLog {
  id: string;
  title: string;
  type: string;
  muscleGroup: string;
  completedAt: string;
  timestamp: number;
  durationMinutes: number;
  caloriesBurned: number;
  exercisesCount: number;
  exercisesSummary: string[];
}

export interface WorkoutPreset {
  id: string;
  title: string;
  muscleGroup: string;
  type: string;
  intensity: Intensity;
  durationMinutes: number;
  caloriesEstimate: number;
  image: string;
  description: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    calories: number;
    weightKg?: number;
  }[];
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
  bio?: string;
  weightKg?: number;
  heightCm?: number;
  dailyCalorieTarget?: number;
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
