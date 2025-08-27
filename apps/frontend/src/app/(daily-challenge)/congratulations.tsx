import { router } from "expo-router";

import { Congratulations } from "@/components/daily-challenge/congratulations";
import { View } from "@/components/ui";

export default function CongratulationsScreen() {
  const handleClose = () => {
    // Navigate back to profile page
    router.replace("/dashboard");
  };

  return (
    <View className="flex-1">
      {/* Main Congratulations Component */}
      <Congratulations onClose={handleClose} />
    </View>
  );
}
