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
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
