import { Banking } from "./banking";
import { Range } from "./primitives";

export interface SpendMeta {
  monthlySpendAssumptionUSD: number;
  usdPerMs: number;
}

export interface User {
  version: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  banking: Banking | null;
  tier: number;
  demographic: {
    gender: "male" | "female" | "non-binary" | null;
    age: Range | null; //Age range
    gambling: {
      frequency: "multiple-times-a-day" | "daily" | "weekly" | "monthly" | null;
      ageStarted: Range | null;
      monthlySpend: Range | null;
      estimatedLifetimeLoss: number | null;
    };
    existingRecoveryDays?: number; // Days of recovery they had before joining
  };
  streak: {
    start: number; // Timestamp
  };
  dailyChallenge: {
    streakCount: number;
    lastCompletedDate: string | null; // ISO string, device TZ - null if never completed
    currentWeek: boolean[]; // Array[7] of Mon-Sun completion flags
    currentDayState: "pending" | "completed" | "skipped";
  };
  message: string | null;
  guardian: {
    guardianId: string | null;
    buddy: {
      userId: string | null; // The user who's guardian you bought
    };
  };
  messaging: {
    token: string | null;
    createdAt: number | null;
  };
  spendMeta?: SpendMeta;
}
