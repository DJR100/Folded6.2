import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Platform, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { FontAwesome } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

import { Button, Input, Text, View } from "@/components/ui";
import { auth, useAuthContext } from "@/hooks/use-auth-context";
import { api } from "@/lib/firebase";

export default function CreateAccountScreen() {
  const { linkAnonymousAccount, user, updateUser } = useAuthContext();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);

  if (user?.tier) return <Redirect href="/dashboard" />;

  return (
    <View className="flex-1 px-4 py-6 gap-8">
      <View className="gap-2">
        <Text variant="h1" className="text-center">
          Create your account
        </Text>
        <Text variant="p" className="text-center" muted>
          To secure your subscription and enable account recovery, please create an account.
        </Text>
      </View>

      <View className="gap-3">
        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <Input
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View className="flex-row items-center gap-2 mt-2">
          <TouchableOpacity onPress={() => setAcceptedLegal((v) => !v)}>
            <View className="w-5 h-5 rounded-md border border-white/40 items-center justify-center">
              {acceptedLegal && (
                <Feather name="check" size={14} color="white" />
              )}
            </View>
          </TouchableOpacity>
          <Text variant="sm" muted>
            By Signing up, you agree to our{" "}
            <Text
              className="text-accent underline"
              onPress={() =>
                WebBrowser.openBrowserAsync("https://folded.app/terms")
              }
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              className="text-accent underline"
              onPress={() =>
                WebBrowser.openBrowserAsync("https://folded.app/privacy")
              }
            >
              Privacy Policy
            </Text>
          </Text>
        </View>

        <Button
          variant="accent"
          text="Create Account"
          disabled={!acceptedLegal}
          onPress={async () => {
            // 1) Link anonymous account to email/password (converts anonymous to permanent)
            try {
              await linkAnonymousAccount(email.trim(), password);
            } catch (e: any) {
              const code: string = e?.code || "";
              if (code.includes("email-already-in-use")) {
                alert("This email is already in use. Please sign in instead.");
              } else if (code.includes("invalid-email")) {
                alert("Please enter a valid email address.");
              } else if (code.includes("weak-password")) {
                alert("Please choose a stronger password.");
              } else {
                alert(
                  e?.message || "Could not create account. Please try again.",
                );
              }
              return;
            }

            // 2) Reserve username (handles username uniqueness)
            try {
              await api({
                endpoint: "user-reserveUsername",
                data: {
                  username: username.trim(),
                  firstName: null,
                },
              });
              await updateUser("legal", {
                tosAccepted: true,
                privacyAccepted: true,
                acceptedAt: Date.now(),
              });
              router.replace("/post-onboarding");
            } catch (e: any) {
              const code: string = e?.code || ""; // e.g. "functions/already-exists"
              if (code.includes("already-exists")) {
                alert(
                  "That username is already taken. Please try another one.",
                );
              } else {
                alert(
                  e?.message ||
                    "Could not reserve username. Please try a different one.",
                );
              }
            }
          }}
        />

        {Platform.OS === "ios" && (
          <Button
            variant="white"
            text="Continue with Apple"
            iconL={<FontAwesome name="apple" size={20} color="black" />}
            onPress={() => {
              // TODO: Wire up real Apple one-tap sign-in for account creation
              if (__DEV__) {
                console.log("Apple Sign-In (create-account) pressed (UX stub)");
              }
            }}
          />
        )}
      </View>
    </View>
  );
}

