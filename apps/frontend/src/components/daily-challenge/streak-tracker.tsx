import AntDesign from "@expo/vector-icons/AntDesign";
import { StreakTrackerProps } from "@folded/types";
import React from "react";

import { Text, View } from "@/components/ui";

export function StreakTracker({
  streakCount,
  weekProgress,
  className = "",
}: StreakTrackerProps) {
  return (
    <View className={className}>
      {/* Header Strip - extracted from profile.tsx lines 84-101 */}
      <View className="flex-row items-center justify-between">
        {/* Left side - Fire emoji and streak text */}
        <View className="flex-row items-center">
          <Text className="text-lg">🔥</Text>
          <Text className="ml-2 text-base font-medium">
            {streakCount}-day streak!
          </Text>
        </View>

        {/* Right side - Info icon aligned with Sunday label center */}
        <View style={{ marginRight: 4 }}>
          <AntDesign
            name="infocirlceo"
            size={16}
            color="white"
            style={{ opacity: 0.6 }}
          />
        </View>
      </View>

      {/* Day-by-Day Tracker Row - extracted from profile.tsx lines 103-187 */}
      <View className="mt-4">
        <View className="relative">
          {/* Day Labels Row */}
          <View className="flex-row justify-between mb-2">
            {weekProgress.map((dayData, index) => (
              <Text
                key={index}
                className="text-xs text-center w-6"
                style={{
                  color: dayData.isToday ? "#F97316" : "#9CA3AF", // Orange for today, grey for others
                }}
              >
                {dayData.day}
              </Text>
            ))}
          </View>

          {/* Circles Row with Progress Rail */}
          <View className="relative">
            {/* Progress Rail - symmetric line extending equally on both sides */}
            <View
              className="absolute"
              style={{
                height: 1,
                backgroundColor: "#9CA3AF",
                top: 11, // Center of 24px circles (12px from top)
                left: -12, // Extend left by half circle width
                right: -12, // Extend right by half circle width
              }}
            />

            {/* Seven Day Circles - perfectly aligned under labels */}
            <View className="flex-row justify-between">
              {weekProgress.map((dayData, index) => (
                <View
                  key={index}
                  className="w-6 h-6 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: dayData.completed ? "#3DF08B" : "#4B5563", // Your existing green or grey
                  }}
                >
                  {dayData.completed && (
                    <AntDesign name="check" size={12} color="white" />
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
