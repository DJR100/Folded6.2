import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Platform } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import { Button, Input, Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function SignInScreen() {
  const { signIn, signUp, user } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user?.tier) return <Redirect href="/dashboard" />;
  if (user) return <Redirect href="/onboarding" />;

  return (
    <View className="flex-1 px-4 py-6 gap-8">
      <View className="gap-2">
        <Text variant="h1" className="text-center">
          Welcome back
        </Text>
        <Text variant="p" className="text-center" muted>
          Sign in to continue your recovery.
        </Text>
      </View>

      <View className="gap-3">
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
          text="Sign In"
          onPress={async () => {
            const e = email.trim();
            try {
              await signIn(e, password);
            } catch (err: any) {
              const code: string = err?.code || err?.message || "";
              const isDemoEmail = e.toLowerCase() === "test1234@test.com";
              if (isDemoEmail && code.includes("user-not-found")) {
                try {
                  await signUp(e, password);
                } catch (inner: any) {
                  alert(
                    inner?.message || "Could not create demo account. Try again.",
                  );
                }
              } else {
                alert(
                  err?.message ||
                    "Sign in failed. Please check your credentials.",
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
              // TODO: Wire up real Apple one-tap sign-in
              if (__DEV__) {
                console.log("Apple Sign-In pressed (UX stub)");
              }
            }}
          />
        )}

        <View className="items-center gap-2 mt-2">
          <Text variant="sm" muted>
            Don&apos;t have an account?{" "}
            <Text
              className="text-accent"
              onPress={() => router.back()}
            >
              Get Started
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
