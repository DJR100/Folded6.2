import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";
import * as Application from "expo-application";
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
const SUPPORT_EMAIL = "me@dillonroberts.co.uk";
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
          onPress={() => Alert.alert("Coming to the app store soon.")}
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
          onPress={() => WebBrowser.openBrowserAsync(WHATSAPP_GROUP_URL)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="message-square" size={16} color="white" />
              <Text className="text-white">Join the Community</Text>
            </View>
            <ChevronRight />
          </View>
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
          className="bg-white/5 rounded-xl px-4 py-4 mb-6"
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
              <Text className="text-white">Support Email</Text>
            </View>
            <ChevronRight />
          </View>
        </TouchableOpacity>

        <Text className="opacity-70 mb-2">ACCOUNT</Text>

        <TouchableOpacity
          className="bg-white/5 rounded-xl px-4 py-4 mb-3"
          onPress={() => router.push("/paywall")}
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
