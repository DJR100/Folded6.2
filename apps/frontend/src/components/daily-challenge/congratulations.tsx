import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useRef, useState } from "react";
import { Alert, Share, TouchableOpacity } from "react-native";
import ViewShot from "react-native-view-shot";

import { Text, View } from "@/components/ui";
import { useDailyChallengeContext } from "@/hooks/daily-challenge-context";
import { useAuthContext } from "@/hooks/use-auth-context";
import { logEvent } from "@/lib/analytics";
import { useResponsive } from "@/lib/responsive";

interface CongratulationsProps {
  onClose: () => void;
}

export function Congratulations({ onClose }: CongratulationsProps) {
  const { user } = useAuthContext();
  const { dailyChallenge } = useDailyChallengeContext();
  const { vw, ms } = useResponsive();

  const displayName = useMemo(
    () => user?.displayName || user?.email?.split("@")[0] || "User",
    [user],
  );

  const days = useMemo(() => {
    if (typeof dailyChallenge?.streakCount === "number")
      return dailyChallenge.streakCount;
    const start = user?.streak?.start ?? Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.max(0, Math.floor((Date.now() - start) / msPerDay));
  }, [dailyChallenge?.streakCount, user?.streak?.start]);

  const isFirstDay = days === 1;
  const cardRef = useRef<any>(null);
  const [sharing, setSharing] = useState(false);
  const CARD_SIZE = Math.min(vw(80), ms(320)); // responsive on-screen preview size
  const CARD_INNER_MIN_HEIGHT = CARD_SIZE * 0.72; // tighten inner white card height

  const onShare = async () => {
    let method: "image" | "text" = "text";
    let outcome: "shared" | "dismissed" | "unknown" | "error" = "unknown";

    try {
      // Decide sharing method once
      let isAvailableAsync: undefined | (() => Promise<boolean>);
      let shareImageAsync:
        | undefined
        | ((uri: string, options?: any) => Promise<void>);
      try {
        const mod: any = await import("expo-sharing");
        isAvailableAsync =
          mod?.isAvailableAsync ?? mod?.default?.isAvailableAsync;
        shareImageAsync = mod?.shareAsync ?? mod?.default?.shareAsync;
      } catch {}

      const canShareImage =
        !!isAvailableAsync && !!shareImageAsync && (await isAvailableAsync());

      if (canShareImage && cardRef.current?.capture) {
        method = "image";
        setSharing(true);
        try {
          const uri = await cardRef.current.capture();
          if (uri) {
            await shareImageAsync!(uri, {
              mimeType: "image/png",
              UTI: "public.png",
              dialogTitle: "Share your recovery progress",
            });
            outcome = "unknown"; // expo-sharing doesn't report completion
          } else {
            outcome = "error";
            method = "text"; // fall back
          }
        } catch {
          outcome = "error";
          method = "text"; // fall back
        } finally {
          setSharing(false);
        }
      }

      if (method === "text") {
        const message = isFirstDay
          ? "Day 1 - Taking the first step towards recovery!"
          : `${displayName} has been bet free for ${days} days!`;
        try {
          const result: any = await Share.share({ message });
          if (result?.action === Share.sharedAction) outcome = "shared";
          else if (result?.action === Share.dismissedAction)
            outcome = "dismissed";
          else outcome = "unknown";
        } catch {
          outcome = "error";
        }
      }
    } finally {
      await logEvent("share", { method, outcome, isFirstDay, days });
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 px-4">
        <View
          className="rounded-3xl p-8 justify-center"
          style={{
            backgroundColor: "#8B5CF6",
            flex: 1,
            paddingTop: ms(40),
            paddingBottom: ms(36),
          }}
        >
          <View className="mb-6 items-center">
            <Text
              className="text-white text-2xl font-bold text-center leading-tight"
              style={{ lineHeight: 32 }}
            >
              Congratulations on{"\n"}completing today's{"\n"}recovery
              challenge!
            </Text>

            <Text
              className="text-white text-lg font-medium text-center mt-6"
              style={{ opacity: 0.9 }}
            >
              Your streak has been updated.
            </Text>
          </View>

          {/* Visual Preview Card (capturable) */}
          <View
            className="items-center mb-3"
            style={{
              // Pull the buttons upward by reclaiming part of the unused space
              // at the bottom of the square preview (without affecting capture)
              marginBottom: -Math.min(
                (CARD_SIZE - CARD_INNER_MIN_HEIGHT) * 0.5,
                ms(40),
              ),
            }}
          >
            <ViewShot
              ref={cardRef}
              options={{ format: "png", quality: 1, width: 1080, height: 1080 }}
              style={{ width: CARD_SIZE, height: CARD_SIZE }}
            >
              <View
                className="rounded-3xl p-6 items-center"
                style={{
                  backgroundColor: "#FFFFFF",
                  position: "relative",
                  width: CARD_SIZE,
                  minHeight: CARD_INNER_MIN_HEIGHT,
                }}
              >
                {/* Small brand badge - top right */}
                <View
                  style={{
                    position: "absolute",
                    top: ms(8),
                    right: ms(8),
                    opacity: 0.7,
                  }}
                >
                  <Image
                    source={require("@/assets/images/favicon3.png")}
                    style={{ width: 16, height: 16, borderRadius: 3 }}
                    contentFit="contain"
                  />
                </View>

                <View
                  className="w-24 h-24 rounded-full border-2 overflow-hidden items-center justify-center"
                  style={{ borderColor: "#8B5CF6" }}
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
                    <Text className="text-4xl">👤</Text>
                  )}
                </View>

                <Text
                  className="text-lg font-semibold mt-4"
                  style={{ color: "#000000" }}
                >
                  {displayName}
                </Text>

                <View className="mt-4 items-center">
                  <Text className="font-extrabold" style={{ color: "#000000", fontSize: ms(36) }}>
                    {days}
                  </Text>
                  <Text
                    className="mt-1 text-center"
                    style={{ color: "rgba(0,0,0,0.7)" }}
                  >
                    {isFirstDay
                      ? "Taking the first step towards recovery!"
                      : "days bet‑free"}
                  </Text>
                </View>
              </View>
            </ViewShot>
          </View>

          {/* Share Button */}
          <View className="items-center mb-2">
            <TouchableOpacity
              onPress={onShare}
              className="w-full rounded-2xl py-4 px-8"
              style={{
                backgroundColor: "#3DF08B",
                borderWidth: 2,
                borderColor: "transparent",
              }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text
                  className="text-center font-semibold text-lg"
                  style={{ color: "#000000" }}
                >
                  {sharing ? "Sharing…" : "Share on"}
                </Text>
                <FontAwesome name="whatsapp" size={20} color="#000000" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <View className="items-center">
            <TouchableOpacity
              onPress={onClose}
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
                See you tomorrow!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="h-18" />
    </View>
  );
}
