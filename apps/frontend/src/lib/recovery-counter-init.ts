import { DailyChallengeData } from "@folded/types";

/**
 * Initialize all recovery counters based on existing recovery days
 * This handles the bet-free counter, money saved counter, and daily challenge streak
 */
export function initializeRecoveryCounters(existingDays: number) {
  const now = Date.now();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  // 1. Calculate adjusted start time for bet-free counter
  // Money saved counter will automatically use this timestamp
  const adjustedStartTime = now - existingDays * millisecondsPerDay;

  // 🔍 DEBUG: Log the calculation details
  console.log("🔧 Recovery Counter Initialization Debug:");
  console.log(`  📅 Existing days: ${existingDays}`);
  console.log(
    `  ⏰ Current timestamp: ${now} (${new Date(now).toISOString()})`,
  );
  console.log(
    `  ⏰ Adjusted start time: ${adjustedStartTime} (${new Date(adjustedStartTime).toISOString()})`,
  );
  console.log(
    `  📊 Days difference: ${(now - adjustedStartTime) / millisecondsPerDay}`,
  );

  // 2. Initialize daily challenge data to match recovery streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999); // End of day

  const dailyChallengeData: DailyChallengeData = {
    streakCount: existingDays, // Match their recovery streak
    lastCompletedDate: existingDays > 0 ? yesterday.toISOString() : null,
    lastAppOpenDate: null, // Will be set when they first open app
    currentWeek: [false, false, false, false, false, false, false], // Fresh week
    currentDayState: "pending", // Ready for today's challenge
  };

  console.log("🎯 Daily Challenge Data:", dailyChallengeData);

  return {
    streakStart: adjustedStartTime,
    dailyChallenge: dailyChallengeData,
    existingRecoveryDays: existingDays,
  };
}
