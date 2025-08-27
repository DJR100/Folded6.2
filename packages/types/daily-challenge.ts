// Core daily challenge data types
export interface DailyChallengeData {
  streakCount: number;
  lastCompletedDate: string | null;
  lastAppOpenDate: string | null; // NEW: Track last app open
  currentWeek: boolean[];
  currentDayState: "pending" | "completed" | "skipped";
}

// Photo capture types
export interface PhotoResult {
  uri: string;
  type: "camera" | "gallery";
}

// Hook return types
export interface UseDailyChallengeReturn {
  // Data
  dailyChallenge: DailyChallengeData;
  isLoading: boolean;
  error: string | null;

  // Computed values
  timeLeftInDay: {
    hours: number;
    minutes: number;
    seconds: number;
    formatted: string; // "HH:MM:SS"
  };
  shouldAutoLaunch: boolean;
  canStartChallenge: boolean;
  weekProgress: {
    day: "M" | "TU" | "W" | "TH" | "F" | "SA" | "SU";
    completed: boolean;
    isToday: boolean;
  }[];

  // Actions
  startChallenge: () => void;
  completeChallenge: (photo?: PhotoResult) => Promise<void>;
  skipChallenge: () => Promise<void>;
  resetForNewDay: () => Promise<void>;
  trackAppOpen: () => Promise<void>;

  // DEV: Development helpers (only available in dev mode)
  resetDailyChallengeForDev?: () => Promise<void>;
}

// Component prop types
export interface DailyChallengeIntroProps {
  onGetStarted: () => void;
  timeLeft: string;
  streakCount: number;
}

export interface PhotoCaptureProps {
  onPhotoTaken: (photo: PhotoResult) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export interface StreakTrackerProps {
  streakCount: number;
  weekProgress: {
    day: "M" | "TU" | "W" | "TH" | "F" | "SA" | "SU";
    completed: boolean;
    isToday: boolean;
  }[];
  className?: string;
}

export interface ProgressBarProps {
  progress: number; // 0-100
  animated?: boolean;
  className?: string;
}

// Analytics event types
export interface DailyChallengeAnalyticsEvents {
  daily_challenge_shown: {
    streak_count: number;
    time_left_seconds: number;
  };
  daily_challenge_started: {
    streak_count: number;
    entry_point: "auto_launch" | "manual";
  };
  daily_challenge_completed: {
    streak_count: number;
    photo_source: "camera" | "gallery";
    completion_time_seconds: number;
  };
  daily_challenge_skipped: {
    streak_count: number;
    time_left_seconds: number;
  };
  streak_reset: {
    previous_streak: number;
    days_since_last_completion: number;
  };
}

// Context types
export interface DailyChallengeContextValue extends UseDailyChallengeReturn {
  // Additional context-specific methods if needed
}

// Navigation types for daily challenge screens
export interface DailyChallengeScreenParams {
  intro: undefined;
  capture: {
    streakCount: number;
  };
}
