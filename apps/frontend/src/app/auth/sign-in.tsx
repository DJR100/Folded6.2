import { Redirect, router } from "expo-router";
import { useState } from "react";

import { Button, Input, Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function SignInScreen() {
  const { signIn, user } = useAuthContext();
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
            await signIn(email.trim(), password);
          }}
        />

        <View className="items-center gap-2 mt-2">
          <Text variant="sm" muted>
            Don&apos;t have an account?{" "}
            <Text
              className="text-accent"
              onPress={() => router.push("/auth/create-account")}
            >
              Create Account
            </Text>
          </Text>
        </View>
        {/* TODO: Add social login */}
        <View className="gap-2 mt-4">
          <Button
            variant="glass"
            text="Continue with Apple (placeholder)"
            onPress={() => router.push("/auth/create-account")}
          />
          <Button
            variant="glass"
            text="Continue with Google (placeholder)"
            onPress={() => router.push("/auth/create-account")}
          />
        </View>
      </View>
    </View>
  );
}
