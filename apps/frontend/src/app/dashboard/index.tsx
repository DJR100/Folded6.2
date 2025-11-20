import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StreakTracker } from "@/components/daily-challenge/streak-tracker";
import { DashboardLayout } from "@/components/layouts/dashboard";
import { MoneySavedTicker } from "@/components/money-saved-ticker";
import { PanicButton } from "@/components/panic-button";
import { ProfileEditModal } from "@/components/profile-edit-modal";
import { Text, View } from "@/components/ui";
import {
  DailyChallengeProvider,
  useDailyChallengeContext,
} from "@/hooks/daily-challenge-context";
import { useAuthContext } from "@/hooks/use-auth-context";
import { cn } from "@/lib/cn";
import BetFreeTimer from "@/components/BetFreeTimer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { track } from "@/lib/mixpanel";
import { useResponsive } from "@/lib/responsive";
import { colors } from "@/constants/colors";

const ProfileHeaderInline = React.memo(function ProfileHeaderInline() {
  const { user } = useAuthContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const { vw, ms } = useResponsive();
  const avatarSize = Math.max(112, Math.min(vw(42), ms(180)));

  return (
    <View className="items-center">
      <View
        className="rounded-full border-2 border-gray-400 items-center justify-center overflow-hidden"
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          borderColor: "#9CA3AF",
        }}
      >
        {user?.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
          />
        ) : (
          <Text className="text-4xl mt-[40px]">👤</Text>
        )}
      </View>

      <View className="flex-row items-center justify-center mt-3 relative">
        <Text
          className="text-lg font-semibold"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.9}
        >
          {displayName}
        </Text>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={{ position: "absolute", right: -24 }}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <AntDesign
            name="edit"
            size={18}
            color="white"
            style={{ opacity: 0.6 }}
          />
        </TouchableOpacity>
      </View>

      <ProfileEditModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
});

// Auto-fit wrapper that scales content down to fit available height; never upscales
function AutoFit({ children }: { children: React.ReactNode }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [contentH, setContentH] = useState<number | null>(null);

  const TAB_BAR_H = 40; // matches dashboard/_layout.tsx tabBarStyle.height
  const reserved = 24 + insets.top + insets.bottom + TAB_BAR_H;
  const avail = Math.max(0, height - reserved);
  const scale = contentH ? Math.min(1, avail / contentH) : 1;

  return (
    <View style={{ alignItems: "center", width: "100%" }}>
      <View
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (!contentH || Math.abs(h - contentH) > 2) setContentH(h);
        }}
        style={{
          width: "100%",
          maxWidth: 720,
          transform: [{ scale }],
        }}
      >
        {children}
      </View>
    </View>
  );
}

// Internal component that uses the daily challenge context
function DashboardContent() {
  const { user } = useAuthContext();

  // First/any dashboard view tracking
  useEffect(() => {
    (async () => {
      try {
        const key = "mp_has_seen_dashboard";
        const seen = await AsyncStorage.getItem(key);
        if (!seen) {
          track("dashboard_viewed", { first_time: true, screen_group: "dashboard" });
          await AsyncStorage.setItem(key, "1");
        } else {
          track("dashboard_viewed", { first_time: false, screen_group: "dashboard" });
        }
      } catch {}
    })();
  }, []);

  // Connect to daily challenge system
  const {
    dailyChallenge,
    weekProgress,
    canStartChallenge,
    timeLeftInDay,
    isLoading,
  } = useDailyChallengeContext();

  const [streak, setStreak] = useState<{
    major: { value: number; units: string };
    minor: { value: number; units: string };
  }>({ major: { value: 0, units: "s" }, minor: { value: 0, units: "ms" } });

  // Your existing streak calculation logic
  useEffect(() => {
    const calculateStreak = () => {
      const streakMs = user?.streak?.start ? Date.now() - user.streak.start : 0;
      const milliseconds = Math.floor(Math.floor(streakMs % 1000) / 10);
      const seconds = Math.floor((streakMs / 1000) % 60);
      const minutes = Math.floor((streakMs / (1000 * 60)) % 60);
      const hours = Math.floor((streakMs / (1000 * 60 * 60)) % 24);
      const days = Math.floor(streakMs / (1000 * 60 * 60 * 24));

      if (days > 0) {
        setStreak({
          major: { value: days, units: "d" },
          minor: { value: hours, units: "h" },
        });
      } else if (hours > 0) {
        setStreak({
          major: { value: hours, units: "h" },
          minor: { value: minutes, units: "m" },
        });
      } else if (minutes > 0) {
        setStreak({
          major: { value: minutes, units: "m" },
          minor: { value: seconds, units: "s" },
        });
      } else if (seconds > 0) {
        setStreak({
          major: { value: seconds, units: "s" },
          minor: { value: milliseconds, units: "" },
        });
      } else {
        setStreak({
          major: { value: 0, units: "s" },
          minor: { value: milliseconds, units: "" },
        });
      }
    };

    // 🔍 ONE-TIME DEBUG: Log what we're working with (only once per user change)
    if (__DEV__) {
      console.log("🎯 Dashboard Debug - User streak data:");
      console.log(`  👤 User streak.start: ${user?.streak?.start}`);
      console.log(
        `  👤 User streak.start readable: ${user?.streak?.start ? new Date(user.streak.start).toISOString() : "undefined"}`,
      );
      console.log(
        `  📊 Daily challenge streak count: ${dailyChallenge.streakCount}`,
      );
      console.log(
        `  📊 Existing recovery days: ${user?.demographic?.existingRecoveryDays}`,
      );
    }

    calculateStreak();
    const streakMs = user?.streak?.start ? Date.now() - user.streak.start : 0;
    const timeout = streakMs > 60 * 1000 ? 1000 : 33;
    const interval = setInterval(calculateStreak, timeout);
    return () => clearInterval(interval);
  }, [user?.streak?.start]);

  // Daily challenge button configuration
  const getButtonConfig = () => {
    if (dailyChallenge.currentDayState === "completed") {
      return {
        text: `${timeLeftInDay.formatted} until next challenge`,
        disabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.15)", // Glass-like transparency
        backdropFilter: "blur(10px)", // Blur effect (if supported)
        borderColor: "rgba(255, 255, 255, 0.4)", // Bright border
        borderWidth: 1,
        textColor: "#FFFFFF",
        textOpacity: 1.0,
        buttonOpacity: 1.0,
      };
    } else if (dailyChallenge.currentDayState === "skipped") {
      return {
        text: "Try Daily Challenge Again",
        disabled: false,
        backgroundColor: "#F59E0B",
        textColor: "#FFFFFF",
        textOpacity: 1.0,
        buttonOpacity: 1.0,
      };
    } else if (canStartChallenge) {
      return {
        text: "Start Daily Challenge",
        disabled: false,
        backgroundColor: colors.accent,
        textColor: "#FFFFFF",
        textOpacity: 1.0,
        buttonOpacity: 1.0,
      };
    } else {
      return {
        text: "Challenge Not Available",
        disabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        textColor: "#FFFFFF",
        textOpacity: 0.5,
        buttonOpacity: 1.0,
      };
    }
  };

  const buttonConfig = getButtonConfig();
  const usdPerMs = user?.spendMeta?.usdPerMs;
  const quitTimestampMs = user?.streak?.start;

  // (Removed time-left ring state and calculations)

  return (
    <DashboardLayout>
      <AutoFit>
        <View className="flex justify-between">
        {/* Header with Folded branding */}
        <View className="flex-row items-center justify-between mb-4">
          {/* Left spacer to balance the gear width */}
          <View className="w-8" />
          {/* Centered title */}
          <Text
            className="text-center text-3xl font-bold flex-1"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            FOLDED
          </Text>
          {/* Right gear, same width as left spacer to keep title perfectly centered */}
          <View className="w-8 items-center">
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <AntDesign
                name="setting"
                size={24}
                color="white"
                style={{ opacity: 0.4 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex flex-col gap-6 items-center py-3">
          {/* Avatar */}
          <ProfileHeaderInline />

          <View className="flex flex-col gap-2 items-center">
            {(user?.tier ?? 0) > 0 && (
              <>
                <Text className="text-base font-medium">Bet Free:</Text>
                <BetFreeTimer startTimestampMs={user?.streak?.start ?? null} />
              </>
            )}
            {/* Money Saved Ticker */}
            {usdPerMs && quitTimestampMs && (
              <View className="mt-1 items-center">
                <Text className="text-base font-medium">Money Saved:</Text>
                <MoneySavedTicker
                  usdPerMs={usdPerMs}
                  quitTimestampMs={quitTimestampMs}
                />
              </View>
            )}
          </View>

          {/* Daily Challenge Button with updated styling */}
          <View className="w-full px-4 mt-3">
            <View>
              <TouchableOpacity
                onPress={() => {
                  if (!buttonConfig.disabled) {
                    if (__DEV__)
                      console.log("🔥 Starting daily challenge flow");
                    router.push("/(daily-challenge)/intro");
                  }
                }}
                disabled={buttonConfig.disabled || isLoading}
                className="w-full rounded-lg flex-row items-center justify-center"
                style={{
                  height: 48,
                  backgroundColor: buttonConfig.backgroundColor || colors.accent,
                  opacity: buttonConfig.buttonOpacity,
                  borderColor: buttonConfig.borderColor,
                  borderWidth: buttonConfig.borderWidth || 0,
                  // Add a subtle shadow for depth
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2, // For Android
                }}
              >
                <Text
                  className="font-medium text-center"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.9}
                  style={{
                    color: buttonConfig.textColor || "#FFFFFF",
                    opacity: buttonConfig.textOpacity,
                    // Add text shadow for the "shine through" effect
                    textShadowColor: "rgba(0, 0, 0, 0.3)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  {isLoading ? "Loading..." : buttonConfig.text}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Daily Challenge Streak Tracker */}
          <StreakTracker
            streakCount={dailyChallenge.streakCount}
            weekProgress={weekProgress}
            className="w-full px-4"
          />

          {/* Panic Button inside fitted stack */}
          <View className="w-full px-4">
            <PanicButton />
          </View>
        </View>
        </View>
      </AutoFit>
    </DashboardLayout>
  );
}

// Main export component with scoped provider
export default function Index() {
  return (
    <DailyChallengeProvider>
      <DashboardContent />
    </DailyChallengeProvider>
  );
}
