import {
  DailyChallengeData,
  PhotoResult,
  UseDailyChallengeReturn,
} from "@folded/types";
import { doc, setDoc } from "@react-native-firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthContext } from "./use-auth-context";

import { db } from "@/lib/firebase";

// DEV MODE FLAG - Set to true during development to bypass completed state checks
const DEV_MODE = __DEV__ && true; // Change to false when you want normal behavior

export function useDailyChallenge(): UseDailyChallengeReturn {
  const { user, updateUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get daily challenge data with fallback and ensure all fields exist
  const dailyChallenge: DailyChallengeData = {
    streakCount: user?.dailyChallenge?.streakCount ?? 0,
    lastCompletedDate: user?.dailyChallenge?.lastCompletedDate ?? null,
    lastAppOpenDate: (user?.dailyChallenge as any)?.lastAppOpenDate ?? null, // Handle missing field gracefully
    currentWeek: user?.dailyChallenge?.currentWeek ?? [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
    currentDayState: user?.dailyChallenge?.currentDayState ?? "pending",
  };

  // Calculate time left in current day (memoized)
  const timeLeftInDay = useMemo(() => {
    const now = currentTime;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to 00:00:00

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      hours,
      minutes,
      seconds,
      formatted: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    };
  }, [currentTime]);

  // Add debugging to isFirstOpenToday
  const isFirstOpenToday = useMemo(() => {
    const hasNoLastOpen = !dailyChallenge.lastAppOpenDate;

    if (hasNoLastOpen) {
      if (__DEV__) console.log("✅ isFirstOpenToday: true (no lastAppOpenDate)");
      return true;
    }

    const lastOpen = new Date(dailyChallenge.lastAppOpenDate!);
    const today = new Date();

    const isDifferentDay =
      lastOpen.getDate() !== today.getDate() ||
      lastOpen.getMonth() !== today.getMonth() ||
      lastOpen.getFullYear() !== today.getFullYear();

    if (__DEV__) console.log("🔍 isFirstOpenToday check:", {
      lastAppOpenDate: dailyChallenge.lastAppOpenDate,
      lastOpenFormatted: lastOpen.toLocaleDateString(),
      todayFormatted: today.toLocaleDateString(),
      isDifferentDay,
    });

    return isDifferentDay;
  }, [dailyChallenge.lastAppOpenDate]);

  // Check if streak should be reset (memoized boolean)
  const shouldResetStreak = useMemo(() => {
    if (!dailyChallenge.lastCompletedDate || dailyChallenge.streakCount === 0) {
      return false;
    }

    const lastCompleted = new Date(dailyChallenge.lastCompletedDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset if last completion was before yesterday
    return (
      lastCompleted.getDate() !== yesterday.getDate() ||
      lastCompleted.getMonth() !== yesterday.getMonth() ||
      lastCompleted.getFullYear() !== yesterday.getFullYear()
    );
  }, [dailyChallenge.lastCompletedDate, dailyChallenge.streakCount]);

  // Calculate week progress (memoized)
  const weekProgress = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday = 0

    const days = ["M", "TU", "W", "TH", "F", "SA", "SU"] as const;

    return days.map((day, index) => ({
      day,
      completed: dailyChallenge.currentWeek[index] || false,
      isToday: index === mondayIndex,
    }));
  }, [dailyChallenge.currentWeek]);

  // Add comprehensive debugging to the shouldAutoLaunch logic
  const shouldAutoLaunch = useMemo(() => {
    const conditions = {
      isFirstOpenToday,
      isPending: dailyChallenge.currentDayState === "pending",
      isOnboarded: (user?.tier ?? 0) > 0,
      lastAppOpenDate: dailyChallenge.lastAppOpenDate,
      currentDayState: dailyChallenge.currentDayState,
      userTier: user?.tier,
      devMode: __DEV__,
    };

    const result =
      isFirstOpenToday &&
      dailyChallenge.currentDayState === "pending" &&
      (user?.tier ?? 0) > 0;

    if (__DEV__) console.log("🔍 shouldAutoLaunch calculation:", { ...conditions, finalResult: result });

    return result;
  }, [isFirstOpenToday, dailyChallenge.currentDayState, user?.tier]);

  // Check if user can start challenge (memoized) - allow skipped state too
  const canStartChallenge = useMemo(
    () =>
      DEV_MODE ||
      dailyChallenge.currentDayState === "pending" ||
      dailyChallenge.currentDayState === "skipped",
    [dailyChallenge.currentDayState],
  );

  // DEV: Reset daily challenge state for development
  const resetDailyChallengeForDev = useCallback(async () => {
    if (!user?.uid || !DEV_MODE) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedData: DailyChallengeData = {
        streakCount: dailyChallenge.streakCount, // Keep current streak
        lastCompletedDate: dailyChallenge.lastCompletedDate,
        lastAppOpenDate: dailyChallenge.lastAppOpenDate, // Keep app open tracking
        currentWeek: dailyChallenge.currentWeek, // Keep current week progress
        currentDayState: "pending", // Reset to pending for dev testing
      };

      await updateUser("dailyChallenge", updatedData);
      if (__DEV__) console.log("🔧 DEV: Daily challenge reset to pending state");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset daily challenge",
      );
      console.error("Error resetting daily challenge for dev:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, dailyChallenge, updateUser]);

  // Reset for new day (callback function)
  const resetForNewDay = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check if we need to reset streak
      const resetStreak = shouldResetStreak;

      // Check if it's a new week (Monday)
      const today = new Date();
      const isMonday = today.getDay() === 1;

      // Only reset currentWeek if it's Monday, otherwise preserve it
      const shouldResetWeek = isMonday;

      const updatedData: DailyChallengeData = {
        streakCount: resetStreak ? 0 : dailyChallenge.streakCount,
        lastCompletedDate: dailyChallenge.lastCompletedDate,
        lastAppOpenDate: dailyChallenge.lastAppOpenDate,
        currentWeek: shouldResetWeek
          ? [false, false, false, false, false, false, false] // Reset only on Monday
          : dailyChallenge.currentWeek, // Preserve current week progress
        currentDayState: "pending",
      };

      await updateUser("dailyChallenge", updatedData);

      // Analytics for streak reset
      if (__DEV__) {
        if (resetStreak) console.log("🔥 Streak reset due to missed day");
        if (shouldResetWeek) console.log(" New week started - resetting week progress");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset for new day",
      );
      console.error("Error resetting for new day:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, shouldResetStreak, dailyChallenge, updateUser]);

  // Start challenge
  const startChallenge = useCallback(() => {
    // TODO: Fire analytics event - daily_challenge_started
    if (__DEV__) console.log("📱 Daily challenge started");
  }, []);

  // Complete challenge
  const completeChallenge = useCallback(
    async (photo?: PhotoResult) => {
      if (!user?.uid) return;

      try {
        setIsLoading(true);
        setError(null);

        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // Update current week array
        const newCurrentWeek = [...dailyChallenge.currentWeek];
        newCurrentWeek[mondayIndex] = true;

        const updatedData: DailyChallengeData = {
          streakCount: dailyChallenge.streakCount + 1,
          lastCompletedDate: now.toISOString(),
          lastAppOpenDate: dailyChallenge.lastAppOpenDate, // Keep app open tracking
          currentWeek: newCurrentWeek,
          currentDayState: "completed",
        };

        await updateUser("dailyChallenge", updatedData);

        // TODO: Fire analytics event - daily_challenge_completed
        if (__DEV__) console.log("✅ Daily challenge completed", {
          streakCount: updatedData.streakCount,
          photoSource: photo?.type,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to complete challenge",
        );
        console.error("Error completing challenge:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.uid, dailyChallenge, updateUser, isFirstOpenToday],
  );

  // Skip challenge
  const skipChallenge = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedData: DailyChallengeData = {
        ...dailyChallenge,
        currentDayState: "skipped",
      };

      await updateUser("dailyChallenge", updatedData);

      // TODO: Fire analytics event - daily_challenge_skipped
      if (__DEV__) console.log("⏭️ Daily challenge skipped");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to skip challenge");
      console.error("Error skipping challenge:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, dailyChallenge, updateUser]);

  // Replace the auto-reset effect with this optimized version:
  useEffect(() => {
    // Only run the check if we're in a state that might need reset
    if (isFirstOpenToday && dailyChallenge.currentDayState !== "pending") {
      // Check if the last completion was today
      const wasCompletedToday =
        dailyChallenge.lastCompletedDate &&
        new Date(dailyChallenge.lastCompletedDate).toDateString() ===
          new Date().toDateString();

      if (!wasCompletedToday) {
        if (__DEV__)
          console.log(
            "🔄 Resetting for new day - previous challenge was not completed today",
          );
        resetForNewDay();
      }
    }
  }, [
    isFirstOpenToday,
    dailyChallenge.currentDayState,
    dailyChallenge.lastCompletedDate,
    resetForNewDay,
  ]);

  // Add function to track app opens
  const trackAppOpen = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const now = new Date();
      const updatedData: DailyChallengeData = {
        ...dailyChallenge,
        lastAppOpenDate: now.toISOString(),
      };

      await updateUser("dailyChallenge", updatedData);
      if (__DEV__) console.log("📱 App open tracked");
    } catch (err) {
      console.error("Error tracking app open:", err);
    }
  }, [user?.uid, dailyChallenge, updateUser]);

  // Track app open on first load
  useEffect(() => {
    if (user?.uid && !dailyChallenge.lastAppOpenDate) {
      if (__DEV__) console.log("📱 First app open detected - tracking");
      trackAppOpen();
    }
  }, [user?.uid, dailyChallenge.lastAppOpenDate, trackAppOpen]);

  return {
    // Data
    dailyChallenge,
    isLoading,
    error,

    // Computed values
    timeLeftInDay,
    shouldAutoLaunch,
    canStartChallenge,
    weekProgress,

    // Actions
    startChallenge,
    completeChallenge,
    skipChallenge,
    resetForNewDay,
    trackAppOpen,

    // DEV: Development helpers
    ...(DEV_MODE && { resetDailyChallengeForDev }),
  };
}
