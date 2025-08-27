import React, { useEffect, useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";

import { Text, View } from "@/components/ui";
import { colors } from "@/constants/colors";

const TILE_WIDTH = 28;
const TILE_HEIGHT = 38;

function split(value: number, min = 2) {
  return Math.max(0, value).toString().padStart(min, "0").split("");
}

function Digit({ d }: { d: string }) {
  return (
    <View
      className="mx-[2px] rounded-md items-center justify-center"
      style={{ width: TILE_WIDTH, height: TILE_HEIGHT, backgroundColor: colors.accent }}
    >
      <Text className="text-xl font-[Satoshi-Bold]" style={{ color: "#ffffff" }}>
        {d}
      </Text>
    </View>
  );
}

function Separator() {
  return (
    <View
      className="px-1"
      style={{ height: TILE_HEIGHT, alignItems: "center", justifyContent: "center" }}
    >
      <Text style={{ fontSize: 24, lineHeight: TILE_HEIGHT, opacity: 0.4, color: "#FFFFFF" }}>
        :
      </Text>
    </View>
  );
}

function Segment({ digits, label }: { digits: string[]; label: string }) {
  return (
    <View className="items-center mx-1">
      <View className="flex-row">{digits.map((d, i) => <Digit key={i} d={d} />)}</View>
      <Text className="text-xs mt-1 opacity-70">{label}</Text>
    </View>
  );
}

export default function BetFreeTimer({
  startTimestampMs,
}: {
  startTimestampMs: number | null | undefined;
}) {
  const [now, setNow] = useState(Date.now());
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const { days, hours, minutes, seconds, totalSeconds } = useMemo(() => {
    if (!startTimestampMs)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    const sec = Math.max(0, Math.floor((now - startTimestampMs) / 1000));
    return {
      days: Math.floor(sec / 86400),
      hours: Math.floor((sec % 86400) / 3600),
      minutes: Math.floor((sec % 3600) / 60),
      seconds: sec % 60,
      totalSeconds: sec,
    };
  }, [now, startTimestampMs]);

  const collapsedText = useMemo(() => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    if (totalSeconds < 24 * 3600) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`; // <24h → hh:mm:ss
    }
    if (days < 7) {
      return `${days}d ${hours}h`; // 1–7 days → Xd Yh
    }
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remDays = days % 7;
      return `${weeks}w ${remDays}d`; // ≥7 days → Xw Yd
    }
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    return `${months}m ${remDays}d`; // After a month → Xm Yd
  }, [totalSeconds, days, hours, minutes, seconds]);

  // Render helpers for tile-based collapsed/expanded views
  const renderCollapsedTiles = () => {
    if (totalSeconds < 24 * 3600) {
      return (
        <View className="flex-row items-start justify-center">
          <Segment digits={split(hours, 2)} label="Hours" />
          <Separator />
          <Segment digits={split(minutes, 2)} label="Minutes" />
          <Separator />
          <Segment digits={split(seconds, 2)} label="Seconds" />
        </View>
      );
    }
    if (days < 7) {
      return (
        <View className="flex-row items-start justify-center">
          <Segment digits={split(days, 2)} label="Days" />
          <Separator />
          <Segment digits={split(hours, 2)} label="Hours" />
        </View>
      );
    }
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remDays = days % 7;
      return (
        <View className="flex-row items-start justify-center">
          <Segment digits={split(weeks, 1)} label="Weeks" />
          <Separator />
          <Segment digits={split(remDays, 2)} label="Days" />
        </View>
      );
    }
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    return (
      <View className="flex-row items-start justify-center">
        <Segment digits={split(months, 1)} label="Months" />
        <Separator />
        <Segment digits={split(remDays, 2)} label="Days" />
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setExpanded((e) => !e)}
      accessibilityRole="button"
      accessibilityLabel={expanded ? "Collapse timer" : "Expand timer"}
    >
      {expanded ? (
        <View>
          {totalSeconds < 24 * 3600 ? (
            <View className="flex-row items-start justify-center">
              <Segment digits={split(hours, 2)} label="Hours" />
              <Separator />
              <Segment digits={split(minutes, 2)} label="Minutes" />
              <Separator />
              <Segment digits={split(seconds, 2)} label="Seconds" />
            </View>
          ) : days < 7 ? (
            <View className="flex-row items-start justify-center">
              <Segment digits={split(days, 2)} label="Days" />
              <Separator />
              <Segment digits={split(hours, 2)} label="Hours" />
              <Separator />
              <Segment digits={split(minutes, 2)} label="Minutes" />
              <Separator />
              <Segment digits={split(seconds, 2)} label="Seconds" />
            </View>
          ) : days < 30 ? (
            <View className="flex-row items-start justify-center">
              <Segment digits={split(Math.floor(days / 7), 1)} label="Weeks" />
              <Separator />
              <Segment digits={split(days % 7, 2)} label="Days" />
              <Separator />
              <Segment digits={split(minutes, 2)} label="Minutes" />
              <Separator />
              <Segment digits={split(seconds, 2)} label="Seconds" />
            </View>
          ) : (
            <View className="flex-row items-start justify-center">
              <Segment digits={split(Math.floor(days / 30), 1)} label="Months" />
              <Separator />
              <Segment digits={split(days % 30, 2)} label="Days" />
              <Separator />
              <Segment digits={split(minutes, 2)} label="Minutes" />
              <Separator />
              <Segment digits={split(seconds, 2)} label="Seconds" />
            </View>
          )}
        </View>
      ) : (
        renderCollapsedTiles()
      )}
    </TouchableOpacity>
  );
}


