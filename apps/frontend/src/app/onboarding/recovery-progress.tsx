import { router } from "expo-router";
import { useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

import { OnboardingLayout } from "@/components/layouts/onboarding";
import { Button, Input, Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";
import { initializeRecoveryCounters } from "@/lib/recovery-counter-init";

export default function RecoveryProgress() {
  const { setOnboarding, updateUser } = useAuthContext();
  const [recoveryDays, setRecoveryDays] = useState<string>("");
  const [showCelebration, setShowCelebration] = useState(false);

  const handleInputChange = (text: string) => {
    setRecoveryDays(text);
    const days = parseInt(text);
    if (days > 0 && !showCelebration) {
      setShowCelebration(true);
    } else if (days <= 0) {
      setShowCelebration(false);
    }
  };

  const onContinue = async () => {
    const days = parseInt(recoveryDays) || 0;

    if (__DEV__) {
      console.log(`🚀 Starting recovery counter initialization with ${days} days`);
    }

    // Always initialize counters, even if days is 0
    const { streakStart, dailyChallenge, existingRecoveryDays } =
      initializeRecoveryCounters(days);

    if (__DEV__) {
      console.log("📝 About to update Firebase with:", {
        "streak.start": streakStart,
        "streak.start_readable": new Date(streakStart).toISOString(),
        "dailyChallenge.streakCount": dailyChallenge.streakCount,
        existingRecoveryDays: existingRecoveryDays,
      });
    }

    // 🎯 CRITICAL FIX: Update sequentially to avoid race conditions
    if (__DEV__) console.log("🔧 Step 1: Setting streak.start...");
    await updateUser("streak.start", streakStart);

    if (__DEV__) console.log("🔧 Step 2: Setting dailyChallenge...");
    await updateUser("dailyChallenge", dailyChallenge);

    if (__DEV__) console.log("🔧 Step 3: Setting existingRecoveryDays...");
    await updateUser("demographic.existingRecoveryDays", existingRecoveryDays);

    if (__DEV__) {
      console.log(
        `✅ Initialized all recovery counters with ${days} days of existing progress`,
      );
      console.log(
        `🎯 Expected streak start: ${new Date(streakStart).toISOString()}`,
      );
    }

    // Small delay to ensure Firestore sync
    await new Promise((resolve) => setTimeout(resolve, 500));

    setOnboarding(4);
    router.push("/onboarding/4");
  };

  const onJustStarting = async () => {
    if (__DEV__) console.log("🚀 Starting fresh recovery (0 days)");

    // Use the same initialization logic with 0 days
    const { streakStart, dailyChallenge } = initializeRecoveryCounters(0);

    if (__DEV__) {
      console.log("📝 About to update Firebase with fresh start:", {
        "streak.start": streakStart,
        "streak.start_readable": new Date(streakStart).toISOString(),
        "dailyChallenge.streakCount": dailyChallenge.streakCount,
      });
    }

    // 🎯 CRITICAL FIX: Update sequentially to avoid race conditions
    if (__DEV__) console.log("🔧 Step 1: Setting streak.start...");
    await updateUser("streak.start", streakStart);

    if (__DEV__) console.log("🔧 Step 2: Setting dailyChallenge...");
    await updateUser("dailyChallenge", dailyChallenge);

    if (__DEV__) console.log("🔧 Step 3: Setting existingRecoveryDays...");
    await updateUser("demographic.existingRecoveryDays", 0);

    if (__DEV__) console.log("✅ Initialized all recovery counters for fresh start");

    // Small delay to ensure Firestore sync
    await new Promise((resolve) => setTimeout(resolve, 500));

    setOnboarding(4);
    router.push("/onboarding/4");
  };

  const handleKeyboardSubmit = () => {
    Keyboard.dismiss();
    // Only dismiss keyboard, don't auto-continue
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <OnboardingLayout
        title="Already making progress?"
        titleClassName="text-center"
        onBack={() => {
          setOnboarding(2);
          router.back();
        }}
      >
        <Text variant="p" className="text-center mb-6">
          If you've already started your recovery journey, let us know how many
          days you've been gambling-free.
        </Text>

        {showCelebration && (
          <View className="bg-accent/20 p-4 rounded-xl mb-4 border border-accent/30">
            <Text className="text-center font-bold text-accent">
              🎉 Amazing! {recoveryDays} day
              {parseInt(recoveryDays) !== 1 ? "s" : ""} of progress
            </Text>
            <Text className="text-center text-sm text-accent/80 mt-1">
              All your counters will show this progress when you complete
              onboarding
            </Text>
          </View>
        )}

        <View className="flex flex-col gap-4 mb-6">
          <Input
            placeholder="Enter days (e.g., 7)"
            keyboardType="numeric"
            returnKeyType="done"
            value={recoveryDays}
            onChangeText={handleInputChange}
            onSubmitEditing={handleKeyboardSubmit}
            blurOnSubmit={true}
          />

          <Text variant="sm" muted className="text-center">
            Don't worry if you're just starting - every journey begins with day
            1
          </Text>
        </View>

        <View className="flex flex-col gap-3">
          <Button
            text="Continue"
            onPress={onContinue}
            disabled={recoveryDays === ""}
          />

          <Button
            text="I'm just starting"
            variant="secondary"
            onPress={onJustStarting}
          />
        </View>
      </OnboardingLayout>
    </TouchableWithoutFeedback>
  );
}
