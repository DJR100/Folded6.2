// import { Range } from "@folded/types";
// import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect } from "react";

// import OnboardingForm, {
//   OnboardingFormStage,
// } from "@/components/onboarding-form";
// import { Text, View } from "@/components/ui";
// import { colors } from "@/constants/colors";
import { useAuthContext } from "@/hooks/use-auth-context";

// COMMENTED OUT IMAGE SELECTION FUNCTIONALITY - keeping for future use
// const pickImage = async (_: string | Range) => {
//   // No permissions request is necessary for launching the image library
//   const result = await ImagePicker.launchImageLibraryAsync({
//     mediaTypes: ["images", "videos"],
//     allowsEditing: true,
//     aspect: [4, 3],
//     quality: 1,
//   });
//
//   console.log(result);
//
//   if (result.canceled) return;
//
//   // TODO: Upload image to firebase storage
//
//   return result.assets[0].uri;
// };
//
// const RecoveryBadge = ({
//   recovery,
//   opacity,
// }: {
//   recovery: number;
//   opacity: string;
// }) => (
//   <View
//     className="rounded-full p-2 px-4 w-[120px]"
//     style={{ backgroundColor: colors.accent + opacity }}
//   >
//     <Text className="font-bold text-sm text-center text-accentForeground">
//       +{recovery}% recovery
//     </Text>
//   </View>
// );
//
// const stages: OnboardingFormStage[] = [
//   {
//     title: "First, we need you to upload an important picture.",
//     subtitle:
//       "What kind of picture would you like to upload? Other community members may see this image.",
//     options: [
//       {
//         value: "child",
//         label: "You as a child",
//         iconL: <RecoveryBadge recovery={10} opacity={"ff"} />,
//         flexText: true,
//         onPress: pickImage,
//       },
//       {
//         value: "now",
//         label: "You now",
//         iconL: <RecoveryBadge recovery={6} opacity={"a0"} />,
//         flexText: true,
//         onPress: pickImage,
//       },
//       {
//         value: "beautiful",
//         label: "A nice picture you took",
//         iconL: <RecoveryBadge recovery={3} opacity={"50"} />,
//         flexText: true,
//         onPress: pickImage,
//       },
//       {
//         value: "inspiration",
//         label: "A character that inspires you",
//         onPress: pickImage,
//       },
//     ],
//   },
// ];

export default function Onboarding() {
  const { setOnboarding } = useAuthContext();

  // Skip image selection step - immediately move to step 4
  useEffect(() => {
    const skipToNextStep = () => {
      setOnboarding(4);
      router.push("/onboarding/4");
    };

    skipToNextStep();
  }, [setOnboarding]);

  return null; // Return null since we're immediately redirecting

  // COMMENTED OUT - keeping for future use
  // return <OnboardingForm stages={stages} onComplete={onComplete} />;
}
