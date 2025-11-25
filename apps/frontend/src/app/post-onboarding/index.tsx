import { router } from "expo-router";

import { OnboardingLayout } from "@/components/layouts/onboarding";
import { Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function Onboarding() {
  const { setPostOnboarding, updateUser } = useAuthContext();

  return (
    <OnboardingLayout
      title="Thanks for Joining"
      button={{
        text: "Start Recovery",
        onPress: async () => {
          // ✅ CRITICAL FIX: Update tier in database to mark onboarding complete
          await updateUser("tier", 1);
          setPostOnboarding("DONE");
          
          // Wait for user state to update before navigating
          // This ensures the dashboard receives the updated tier value and user object
          await new Promise(resolve => setTimeout(resolve, 500));
          
          router.push("/dashboard");
        },
      }}
    >
      <Text variant="p">You’ve just taken back control.</Text>
      <View className="h-2" />
      <Text variant="p">
        You should feel proud for wanting to change your life.
      </Text>
      <View className="h-2" />
      <Text variant="p">The best time to invest in yourself is now.</Text>
    </OnboardingLayout>
  );
}
