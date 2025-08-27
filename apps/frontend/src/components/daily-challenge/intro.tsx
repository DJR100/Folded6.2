import { DailyChallengeIntroProps } from "@folded/types";
import React from "react";
import { TouchableOpacity } from "react-native";

import { Button, Text, View } from "@/components/ui";

export function DailyChallengeIntro({
  onGetStarted,
  timeLeft,
  streakCount,
}: DailyChallengeIntroProps) {
  return (
    <View className="flex-1 bg-background">
      {/* Main Content Card - Removed shadow/shine effects */}
      <View className="flex-1 px-4">
        <View
          className="rounded-3xl p-8 justify-center"
          style={{
            backgroundColor: "#8B5CF6", // Changed from green to purple
            minHeight: 500, // Much larger
            flex: 1, // Take up more space
          }}
        >
          {/* Left-aligned challenge texts */}
          <View className="mb-12">
            <Text className="text-white text-lg font-medium mb-4 text-left">
              Daily Challenge
            </Text>

            <Text
              className="text-white text-2xl font-bold text-left mb-8 leading-tight"
              style={{ lineHeight: 32 }}
            >
              Answer the{"\n"}following question{"\n"}today.
            </Text>
          </View>

          {/* Centrally aligned timer and button section */}
          <View className="items-center">
            {/* Countdown Timer */}
            <Text
              className="text-white text-4xl font-bold mb-2"
              style={{ fontFamily: "monospace" }}
            >
              {timeLeft}
            </Text>

            <Text className="text-white text-sm mb-12 opacity-70">
              left to extend your {streakCount}-day streak!
            </Text>

            {/* Get Started Button */}
            <TouchableOpacity
              onPress={onGetStarted}
              className="w-full rounded-2xl py-4 px-8"
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 2,
                borderColor: "transparent",
              }}
              activeOpacity={0.8}
            >
              <Text
                className="text-center font-semibold text-lg"
                style={{ color: "#000000" }}
              >
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom spacing for navigation bar */}
      <View className="h-20" />
    </View>
  );
}
