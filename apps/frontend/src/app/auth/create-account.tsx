import { Redirect, router } from "expo-router";
import { useState } from "react";

import { Button, Input, Text, View } from "@/components/ui";
import { auth, useAuthContext } from "@/hooks/use-auth-context";
import { api } from "@/lib/firebase";
import Feather from "@expo/vector-icons/Feather";
import * as WebBrowser from "expo-web-browser";
import { TouchableOpacity } from "react-native";

export default function CreateAccountScreen() {
  const { signUp, user, updateUser } = useAuthContext();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);

  if (user?.tier) return <Redirect href="/dashboard" />;
  if (user) return <Redirect href="/onboarding" />;

  return (
    <View className="flex-1 px-4 py-6 gap-8">
      <View className="gap-2">
        <Text variant="h1" className="text-center">
          Create your account
        </Text>
        <Text variant="p" className="text-center" muted>
          Join Folded and start your journey today.
        </Text>
      </View>

      <View className="gap-3">
        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <Input
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
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
            // 1) Create Firebase Auth user (handles email uniqueness)
            try {
              await signUp(email.trim(), password);
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
                  firstName: firstName.trim() || null,
                },
              });
              await updateUser("legal", {
                tosAccepted: true,
                privacyAccepted: true,
                acceptedAt: Date.now(),
              });
              router.replace("/onboarding");
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

        <View className="items-center gap-2 mt-2">
          <Text variant="sm" muted>
            Already have an account?{" "}
            <Text
              className="text-accent"
              onPress={() => router.replace("/auth/sign-in")}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
