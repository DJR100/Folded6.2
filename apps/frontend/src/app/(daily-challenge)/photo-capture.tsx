import { PhotoResult } from "@folded/types";
import { router } from "expo-router";

import { PhotoCapture } from "@/components/daily-challenge/photo-capture";
import { View } from "@/components/ui";
import { useDailyChallengeContext } from "@/hooks/daily-challenge-context";

export default function PhotoCaptureScreen() {
  const { completeChallenge, skipChallenge, isLoading } =
    useDailyChallengeContext();

  const handlePhotoTaken = async (photo: PhotoResult) => {
    try {
      await completeChallenge(photo);
      // Navigate to congratulations page - challenge completed with photo
      router.push("/(daily-challenge)/congratulations");
    } catch (error) {
      console.error("Error completing challenge:", error);
      // Could show error alert here
    }
  };

  const handleSkip = async () => {
    try {
      await skipChallenge();
      // Navigate back to profile page - challenge skipped (no congratulations)
      router.replace("/dashboard");
    } catch (error) {
      console.error("Error skipping challenge:", error);
    }
  };

  return (
    <View className="flex-1">
      {/* Main Photo Capture Component */}
      <PhotoCapture
        onPhotoTaken={handlePhotoTaken}
        onSkip={handleSkip}
        isLoading={isLoading}
      />
    </View>
  );
}
