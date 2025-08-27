import { router } from "expo-router";

import { DailyChallengeIntro } from "@/components/daily-challenge/intro";
import { View } from "@/components/ui";
import { useDailyChallengeContext } from "@/hooks/daily-challenge-context";

export default function DailyChallengeIntroScreen() {
  const { dailyChallenge, timeLeftInDay, startChallenge, canStartChallenge } =
    useDailyChallengeContext();

  const handleGetStarted = () => {
    if (!canStartChallenge) return;

    startChallenge(); // Analytics event
    router.push("/(daily-challenge)/photo-capture");
  };

  // DEV MODE: Allow access even if completed - in dev mode, show the flow regardless
  const isDev = __DEV__;
  const shouldShowFlow =
    isDev ||
    dailyChallenge.currentDayState === "pending" ||
    dailyChallenge.currentDayState === "skipped";

  // If user already completed today and not in dev mode, redirect back
  if (!shouldShowFlow) {
    router.back();
    return null;
  }

  return (
    <View className="flex-1">
      {/* Main Intro Component */}
      <DailyChallengeIntro
        onGetStarted={handleGetStarted}
        timeLeft={timeLeftInDay.formatted}
        streakCount={dailyChallenge.streakCount}
      />
    </View>
  );
}
