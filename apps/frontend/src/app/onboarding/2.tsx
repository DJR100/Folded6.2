import { router } from "expo-router";

import { OnboardingLayout } from "@/components/layouts/onboarding";
import { Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function Onboarding() {
  const { setOnboarding } = useAuthContext();

  const score = 0.52;
  const average = 0.13;
  const height = 300;

  return (
    <OnboardingLayout
      title="Analysis complete"
      button={{
        text: "Start recovery",
        onPress: () => {
          setOnboarding(3);
          router.push("/onboarding/recovery-progress");
        },
      }}
      className="gap-0"
    >
      <Text variant="p" className="text-center">
        Your responses indicate a clear problem with gambling.
      </Text>

      <View className="flex-1 flex flex-col gap-4 items-center justify-center">
        <View className="flex flex-row gap-6 w-full justify-center">
          {/* Your score */}
          <View className="flex flex-col items-center gap-1">
            <View
              className="w-[60px] bg-danger rounded-xl flex items-center py-3"
              style={{ height }}
            >
              <Text variant="p" className="text-center font-bold">
                {score * 100}%
              </Text>
            </View>
            <Text>Your score</Text>
          </View>

          <View className="flex flex-col items-center justify-end gap-1">
            <View
              className="w-[60px] bg-content3 rounded-xl flex items-center py-3"
              style={{
                height: (average / score) * height,
              }}
            >
              <Text variant="p" className="text-center font-bold">
                {average * 100}%
              </Text>
            </View>
            <Text>Average</Text>
          </View>
        </View>

        <Text variant="p" className="text-center font-bold">
          <Text variant="p" className="text-danger font-bold">
            {(score - average) * 100}%
          </Text>{" "}
          higher than average score
        </Text>
      </View>
    </OnboardingLayout>
  );
}
