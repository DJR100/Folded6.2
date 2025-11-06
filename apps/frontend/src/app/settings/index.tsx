import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as StoreReview from "expo-store-review";
import * as Notifications from "expo-notifications";
import * as Application from "expo-application";
import { useNetworkState } from "expo-network";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  Platform,
  Switch,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";

import { Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";

const FEEDBACK_URL = "https://forms.gle/7nmUPk3wC15mmL4p8";
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/GAQVvOphcG1BZEJOg636n6";
const SUPPORT_EMAIL = "hello@folded.app";
const SUPPORT_SUBJECT = "Folded App Support";

// helper chevron
const ChevronRight = () => (
  <AntDesign name="right" size={16} color="white" style={{ opacity: 0.5 }} />
);

async function scheduleDailyReminder(hour = 21, minute = 0) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: "Daily check-in", body: "Stay on track today." },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}

export default function SettingsRoot() {
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const { user, updateUser } = useAuthContext();
  const network = useNetworkState();

  const openBrowserFallback = async () => {
    try {
      await WebBrowser.openBrowserAsync(WHATSAPP_GROUP_URL);
    } catch {
      try {
        await Clipboard.setStringAsync(WHATSAPP_GROUP_URL);
        Alert.alert(
          "Invite link copied",
          "We couldn't open a browser. The invite link has been copied to your clipboard.",
        );
      } catch {}
    }
  };

  const showJoinOptions = () =>
    Alert.alert(
      "Join the community",
      "We couldn't open WhatsApp. You can continue in your browser or copy the invite link.",
      [
        { text: "Open in Browser", onPress: openBrowserFallback },
        {
          text: "Copy Invite Link",
          onPress: async () => {
            try {
              await Clipboard.setStringAsync(WHATSAPP_GROUP_URL);
              Alert.alert("Invite link copied", "Paste this in any app to join.");
            } catch {}
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );

  const attemptOpenWhatsApp = async () => {
    try {
      const canOpenWhatsApp = await Linking.canOpenURL("whatsapp://");
      if (canOpenWhatsApp) {
        try {
          await Linking.openURL(WHATSAPP_GROUP_URL);
          return;
        } catch {}
      }
      showJoinOptions();
    } catch {
      showJoinOptions();
    }
  };

  const handleJoinCommunityPress = async () => {
    if (network?.isConnected === false) {
      Alert.alert(
        "No internet connection",
        "Connect to the internet to join the WhatsApp support group.",
      );
      return;
    }

    Alert.alert(
      "Open WhatsApp",
      "You're about to open WhatsApp to join the community.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: attemptOpenWhatsApp },
        { text: "Open in Browser", onPress: openBrowserFallback },
      ],
    );
  };

  const handleReviewPress = async () => {
    // In development, the native in-app review UI never appears.
    if (__DEV__) {
      Alert.alert(
        "Not available in development",
        "The in-app review card only appears on TestFlight or App Store builds.",
      );
      return;
    }

    try {
      const available = await StoreReview.isAvailableAsync();
      if (available) {
        await StoreReview.requestReview();
        return;
      }
    } catch {}

    try {
      const url = await StoreReview.storeUrl();
      if (url) {
        await Linking.openURL(url);
        return;
      }
    } catch {}

    Alert.alert(
      "Review not available",
      "We couldn't show the in-app review prompt on this device right now.",
    );
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="left" size={22} color="white" />
        </TouchableOpacity>
        <Text variant="h3" className="ml-2">
          Settings
        </Text>
      </View>

      <View className="px-4">
        <Text className="opacity-70 mb-2">FEEDBACK</Text>

        <TouchableOpacity
          className="bg-white/5 rounded-xl px-4 py-4 mb-3"
          onPress={handleReviewPress}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="star" size={16} color="white" />
              <Text className="text-white">Give Us a Review</Text>
            </View>
            <ChevronRight />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white/5 rounded-xl px-4 py-4 mb-3"
          onPress={handleJoinCommunityPress}
          disabled={network?.isConnected === false}
          style={{ opacity: network?.isConnected === false ? 0.5 : 1 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="message-square" size={16} color="white" />
              <Text className="text-white">Join the Community</Text>
            </View>
            <ChevronRight />
          </View>
          {network?.isConnected === false && (
            <Text className="text-white/60 text-xs mt-1 ml-7">
              Connect to the internet to join the WhatsApp support group.
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white/5 rounded-xl px-4 py-4 mb-3"
          onPress={() => WebBrowser.openBrowserAsync(FEEDBACK_URL)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="thumbs-up" size={16} color="white" />
              <Text className="text-white">Provide Feedback</Text>
            </View>
            <ChevronRight />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white/5 rounded-xl px-4 py-4 mb-3"
          onPress={async () => {
            const body = `\n\n----- DO NOT REMOVE DEBUG INFO -----\n\nUser ID: ${user?.uid ?? "-"}\nPlatform: ${Platform.OS}\nApp Version: ${Application.nativeApplicationVersion ?? "-"}\n\n`;
            const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
              SUPPORT_SUBJECT,
            )}&body=${encodeURIComponent(body)}`;
            try {
              await Linking.openURL(mailtoUrl);
            } catch {}
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="send" size={16} color="white" />
              <Text className="text-white">Email Folded Support</Text>
            </View>
            <ChevronRight />
          </View>
        </TouchableOpacity>

        <Text className="opacity-70 mb-2">ACCOUNT</Text>

        <TouchableOpacity
          className="bg-white/5 rounded-xl px-4 py-4 mb-3"
          onPress={() => router.push({ pathname: "/paywall", params: { source: "settings" } })}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="credit-card" size={16} color="white" />
              <Text className="text-white">Subscribe</Text>
            </View>
            <ChevronRight />
          </View>
        </TouchableOpacity>

        {/* Notifications row stays as-is (no chevron) */}
        <View className="bg-white/5 rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Feather name="bell" size={16} color="white" />
            <Text className="text-white">Notifications</Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={async (v) => {
              if (v) {
                try {
                  const current = await Notifications.getPermissionsAsync();
                  let status = current.status;
                  if (status !== "granted") {
                    const asked = await Notifications.requestPermissionsAsync();
                    status = asked.status;
                  }
                  if (status !== "granted") {
                    Alert.alert(
                      "Notifications disabled",
                      "Enable notifications in iOS Settings to receive reminders.",
                    );
                    return;
                  }
                  await scheduleDailyReminder();
                } catch {}
              } else {
                try {
                  await Notifications.cancelAllScheduledNotificationsAsync();
                } catch {}
              }

              setRemindersEnabled(v);
              try {
                await updateUser("notifications.remindersEnabled", v);
              } catch {}
            }}
          />
        </View>

        <TouchableOpacity
          className="bg-white/5 rounded-xl px-4 py-4"
          onPress={() => router.push("/settings/account")}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="user" size={16} color="white" />
              <Text className="text-white">Account Settings</Text>
            </View>
            <ChevronRight />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
