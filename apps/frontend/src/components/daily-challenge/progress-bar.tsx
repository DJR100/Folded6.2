import { ProgressBarProps } from "@folded/types";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

import { View } from "@/components/ui";

export function ProgressBar({
  progress,
  animated = true,
  className = "",
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Animate to the target progress over 400ms (as specified in PRD)
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 400,
        useNativeDriver: false, // We're animating width, not transforms
      }).start();
    } else {
      // Set immediately without animation
      animatedWidth.setValue(progress);
    }
  }, [progress, animated, animatedWidth]);

  return (
    <View className={`h-1 rounded-full ${className}`}>
      {/* Background Track */}
      <View
        className="h-full w-full rounded-full"
        style={{ backgroundColor: "#4C4C4C" }} // Neutral grey for track
      >
        {/* Progress Fill */}
        <Animated.View
          className="h-full rounded-full"
          style={{
            backgroundColor: "#00C399", // Folded green for progress
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
              extrapolate: "clamp",
            }),
          }}
        />
      </View>
    </View>
  );
}
