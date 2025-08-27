import { Redirect, router } from "expo-router";
import { useState } from "react";

import { Button, Input, Text, View } from "@/components/ui";
import { auth, useAuthContext } from "@/hooks/use-auth-context";
import { api } from "@/lib/firebase";

export default function CreateAccountScreen() {
  const { signUp, user } = useAuthContext();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        <Button
          variant="accent"
          text="Create Account"
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
