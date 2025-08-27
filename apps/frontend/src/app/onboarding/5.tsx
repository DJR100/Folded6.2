import { router } from "expo-router";
import { useEffect } from "react";
// import { useState } from "react";

// import { Guardian } from "@/components/guardian";
// import { OnboardingLayout } from "@/components/layouts/onboarding";
// import { Text, View } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function Onboarding() {
  const { setOnboarding } = useAuthContext();

  // Skip guardian selection step - immediately move to step 6
  useEffect(() => {
    const skipToNextStep = () => {
      setOnboarding(6);
      router.push("/onboarding/6");
    };

    skipToNextStep();
  }, [setOnboarding]);

  return null; // Return null since we're immediately redirecting

  // COMMENTED OUT GUARDIAN SELECTION FUNCTIONALITY - keeping for future use
  // const [selectedGuardian, setSelectedGuardian] = useState<string>("guardian-0");
  //
  // const onComplete = async () => {
  //   updateUser("guardian.guardianId", selectedGuardian);
  //   setOnboarding(6);
  //   router.push("/onboarding/6");
  // };
  //
  // return (
  //   <OnboardingLayout
  //     title="Choose your Guardian"
  //     button={{
  //       text: "Continue",
  //       onPress: onComplete,
  //       disabled: selectedGuardian === undefined,
  //     }}
  //   >
  //     <Text>
  //       A key part of recovery is having a physical reminder of your journey.
  //     </Text>
  //
  //     <Text>
  //       Select your Guardian below. Once you achieve a 7-day streak, we'll
  //       collect your shipping info and send you a plushie to celebrate!
  //     </Text>
  //
  //     <View className="flex flex-col flex-1 w-full mb-8">
  //       <View className="h-1/2 w-full flex flex-row gap-2 pb-2">
  //         <Guardian
  //           src={require("@/assets/images/guardians/guardian-0.png")}
  //           selected={selectedGuardian === "guardian-0"}
  //           onPress={() => setSelectedGuardian("guardian-0")}
  //         />
  //         <Guardian
  //           src={require("@/assets/images/guardians/guardian-1.png")}
  //           selected={selectedGuardian === "guardian-1"}
  //           onPress={() => setSelectedGuardian("guardian-1")}
  //         />
  //       </View>
  //       <View className="h-1/2 flex flex-row items-center justify-center gap-2">
  //         <Guardian
  //           src={require("@/assets/images/guardians/guardian-2.png")}
  //           selected={selectedGuardian === "guardian-2"}
  //           onPress={() => setSelectedGuardian("guardian-2")}
  //         />
  //         <Guardian
  //           src={require("@/assets/images/guardians/guardian-3.png")}
  //           selected={selectedGuardian === "guardian-3"}
  //           onPress={() => setSelectedGuardian("guardian-3")}
  //         />
  //       </View>
  //     </View>
  //   </OnboardingLayout>
  // );
}
