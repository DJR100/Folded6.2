import { router } from "expo-router";

import { OnboardingLayout } from "@/components/layouts/onboarding";
import { Text } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function Onboarding() {
  const { setPostOnboarding, updateUser } = useAuthContext();

  return (
    <OnboardingLayout
      title="Thanks for joining"
      button={{
        text: "Go to dashboard",
        onPress: async () => {
          // ✅ CRITICAL FIX: Update tier in database to mark onboarding complete
          await updateUser("tier", 1);
          setPostOnboarding("DONE");
          router.push("/dashboard");
        },
      }}
    >
      <Text>You can now continue through to the dashboard.</Text>
    </OnboardingLayout>
  );
}
