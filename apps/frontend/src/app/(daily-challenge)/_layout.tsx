import { Stack, useSegments } from "expo-router";
import { useMemo } from "react";
import { StatusBar, View as RNView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProgressBar } from "@/components/daily-challenge/progress-bar";
import { Text, View } from "@/components/ui";
import { colors } from "@/constants/colors";
import { DailyChallengeProvider } from "@/hooks/daily-challenge-context";

export default function DailyChallengeLayout() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const insets = useSafeAreaInsets();

  // Determine progress based on current route
  const progress = useMemo(() => {
    switch (currentRoute) {
      case "intro":
        return 0;
      case "photo-capture":
        return 50;
      case "congratulations":
        return 100;
      default:
        return 0;
    }
  }, [currentRoute]);

  return (
    <DailyChallengeProvider>
      {/* Full screen background - same grey as rest of app */}
      <RNView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Status Bar */}
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />

        {/* Content area with no top padding - starts right after status bar */}
        <View
          className="flex-1 bg-background"
          style={{
            paddingTop: insets.top,
            paddingBottom: insets.bottom, // Keep bottom safe area for home indicator
          }}
        >
          {/* Persistent Header - Folded text and fire emoji */}
          <View className="flex-row items-center justify-between px-4 pt-2">
            <Text className="text-lg font-medium text-white ml-3">Folded</Text>
            <Text className="text-2xl mr-3">🔥</Text>
          </View>

          {/* Persistent Progress Bar */}
          <ProgressBar progress={progress} className="mx-4 mb-8" />

          {/* Stack Navigation for Content */}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colors.background, // Same background as rest of app
              },
              animation: "slide_from_bottom",
            }}
          >
            <Stack.Screen
              name="intro"
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="photo-capture"
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="congratulations"
              options={{
                gestureEnabled: false,
              }}
            />
          </Stack>
        </View>
      </RNView>
    </DailyChallengeProvider>
  );
}
