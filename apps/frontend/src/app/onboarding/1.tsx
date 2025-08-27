import { router } from "expo-router";
import { useEffect, useState } from "react";

import { OnboardingLayout } from "@/components/layouts/onboarding";
import { Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function Onboarding() {
  const [progress, setProgress] = useState(0);
  const { setOnboarding } = useAuthContext();

  useEffect(() => {
    const updateProgress = () => {
      setProgress((prev) => {
        const newProgress = prev + 0.05;

        if (newProgress >= 1) {
          setOnboarding(2);
          clearInterval(interval);
          router.push("/onboarding/2");
        }

        return newProgress;
      });
    };

    const interval = setInterval(updateProgress, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <OnboardingLayout title="Calculating" progress={progress}>
      <View className="flex-1 justify-center items-center">
        {progress < 0.5 && <Text>Analyzing your data</Text>}
        {progress >= 0.5 && <Text>Building custom plan</Text>}
      </View>
    </OnboardingLayout>
  );
}
