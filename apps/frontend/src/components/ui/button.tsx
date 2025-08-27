import classNames from "classnames";
import React, { useState } from "react";
import { ActivityIndicator, Animated, Pressable, View } from "react-native";

import { Text } from ".";

import { colors } from "@/constants/colors";
import { cn } from "@/lib/cn";

interface ButtonProps {
  variant?:
    | "accent"
    | "outline"
    | "ghost"
    | "white"
    | "secondary"
    | "danger"
    | "dangerOutline"
    | "glass"; // NEW
  size?: "icon" | "default";
  iconL?: React.ReactNode;
  iconR?: React.ReactNode;
  text?: string;
  onPress?: () => Promise<void> | void;
  disabled?: boolean;
  flexText?: boolean;
}

export const Button = ({
  variant = "accent",
  size = "default",
  iconL,
  iconR,
  text,
  onPress,
  disabled,
  flexText,
}: ButtonProps) => {
  const [loading, setLoading] = useState(false);
  const backgroundColorRef = new Animated.Value(0);

  const handlePress = () => {
    Animated.timing(backgroundColorRef, {
      toValue: 1,
      duration: 60,
      useNativeDriver: true,
    }).start();
  };

  const handleRelease = async () => {
    Animated.timing(backgroundColorRef, {
      toValue: 0,
      duration: 60,
      useNativeDriver: true,
    }).start();

    try {
      setLoading(true);
      await onPress?.();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const backgroundColorRange = {
    accent: [colors.accent, colors.accentDark],
    outline: ["#ffffff00", "#ffffff20"],
    ghost: ["#ffffff00", "#ffffff20"],
    white: ["#ffffffff", "#ffffff80"],
    secondary: [colors.content3, colors.content4],
    danger: [colors.danger, colors.dangerDark],
    dangerOutline: ["#ffffff00", "#ffffff20"],
    glass: ["#ffffff18", "#ffffff2B"], // NEW: translucent white glass
  }[variant];

  // Interpolate the background color
  const backgroundColor = backgroundColorRef.interpolate({
    inputRange: [0, 1],
    outputRange: backgroundColorRange,
  });

  const color = {
    accent: "black",
    outline: "white",
    ghost: "white",
    white: "black",
    secondary: "white",
    danger: "white",
    dangerOutline: colors.danger,
    glass: "white", // NEW
  }[variant];

  // Applying the interpolated backgroundColor
  return (
    <Pressable
      disabled={disabled || loading}
      onPressIn={handlePress}
      onPressOut={handleRelease}
      style={{ width: size === "icon" ? undefined : "100%" }}
      className={classNames({
        "opacity-50": disabled,
      })}
    >
      <Animated.View
        style={{ backgroundColor }}
        className={classNames(
          "relative flex-row items-center justify-center gap-2 px-4 py-4 rounded-full",
          {
            "border-2 border-border":
              variant === "outline" || variant === "dangerOutline",
            "border-danger": variant === "dangerOutline",
            "border-2 border-white/30": variant === "glass", // NEW: glass outline
            "w-10 h-10 px-0 py-0": size === "icon",
            "w-full": size === "default",
          },
        )}
      >
        {loading && (
          <ActivityIndicator className="absolute" size={24} color={color} />
        )}

        <View
          className={classNames(
            "relative flex-row items-center justify-center gap-2",
            {
              "opacity-0": loading,
            },
          )}
        >
          {iconL}
          {text && (
            <Text
              className={cn("font-bold", flexText ? "flex-1" : undefined)}
              style={{ color }}
            >
              {text}
            </Text>
          )}
          {iconR}
        </View>
      </Animated.View>
    </Pressable>
  );
};
