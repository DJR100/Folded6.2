import { Redirect, Stack } from "expo-router";

import { colors } from "@/constants/colors";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function OnboardingLayout() {
  const { user } = useAuthContext();

  if (user?.tier) return <Redirect href="/dashboard" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "none",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="1" />
      <Stack.Screen name="2" />
      <Stack.Screen name="recovery-progress" />
      <Stack.Screen name="3" />
      <Stack.Screen name="4" />
      <Stack.Screen name="5" />
      <Stack.Screen name="6" />
      <Stack.Screen name="7" />
      <Stack.Screen name="8" />
    </Stack>
  );
}
