import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Alert, Share, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";
import { api } from "@/lib/firebase";

const ChevronRight = () => (
  <AntDesign name="right" size={16} color="white" style={{ opacity: 0.5 }} />
);

// TODO: replace with your real policy URLs
const PRIVACY_URL = "https://folded.app/privacy";
const TERMS_URL = "https://folded.app/terms";

export default function AccountSettings() {
  const { user, signOut } = useAuthContext();

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="left" size={22} color="white" />
        </TouchableOpacity>
        <Text variant="h3" className="ml-2">
          Account
        </Text>
      </View>

      <View className="px-4">
        <Text className="opacity-70 mb-2">PRIVACY</Text>

        <TouchableOpacity
          className="bg-white/5 rounded-xl px-4 py-4 mb-3"
          onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="shield" size={16} color="white" />
              <Text className="text-white">Privacy Policy</Text>
            </View>
            <ChevronRight />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white/5 rounded-xl px-4 py-4 mb-6"
          onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="file-text" size={16} color="white" />
              <Text className="text-white">Terms of Service</Text>
            </View>
            <ChevronRight />
          </View>
        </TouchableOpacity>

        <Text className="opacity-70 mb-2">SESSION</Text>

        <View className="bg-white/5 rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Feather name="user" size={16} color="white" />
            <Text className="text-white" selectable>
              {user?.email ?? "—"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              if (user?.email) {
                await Clipboard.setStringAsync(user.email);
                Alert.alert("Copied!", "User info copied to clipboard");
              }
            }}
          >
            <Feather
              name="copy"
              size={16}
              color="white"
              style={{ opacity: 0.8 }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-white/5 rounded-xl px-4 py-4 mb-6"
          onPress={() =>
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                  await signOut();
                  router.replace("/");
                },
              },
            ])
          }
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="log-out" size={16} color="#EF4444" />
              <Text className="text-[#EF4444]">Sign Out</Text>
            </View>
            <ChevronRight />
          </View>
        </TouchableOpacity>

        <Text className="opacity-70 mb-2">DANGER</Text>

        <TouchableOpacity
          className="bg-white/5 rounded-xl px-4 py-4"
          onPress={() =>
            Alert.alert(
              "Delete Account",
              "This is permanent and cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Continue",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const res = await api({ endpoint: "user-deleteAccount" });
                      console.log("deleteAccount result:", res);
                      await signOut();
                      router.replace("/");
                    } catch (e) {
                      console.log("deleteAccount error:", e);
                      Alert.alert(
                        "Error",
                        (e as any)?.message ??
                          "We couldn't delete your account. Please try again.",
                      );
                    }
                  },
                },
              ],
            )
          }
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="trash-2" size={16} color="#EF4444" />
              <Text className="text-[#EF4444]">Delete Account</Text>
            </View>
            <ChevronRight />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
