import { Range } from "@folded/types";
import { doc, setDoc } from "@react-native-firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

import { OnboardingLayout } from "@/components/layouts/onboarding";
import { Button, Input, Text } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";
import { db } from "@/lib/firebase";
import { deriveSpendMeta } from "@/lib/moneysaved";
import { mapOnboardingFormStageToStep, trackOnboardingStepView } from "@/lib/funnel";
import { usePathname } from "expo-router";

export interface OnboardingFormStage {
  title: string;
  subtitle?: string;
  options?: {
    value: string | Range;
    label: string;
    iconL?: React.ReactNode;
    flexText?: boolean;
    onPress?: (value: string | Range) => Promise<any>;
  }[];
  inputs?: {
    placeholder: string;
    value: string;
    type?: "numeric";
  }[];
  key?: string;
}

export default function OnboardingForm({
  stages,
  onComplete,
}: {
  stages: OnboardingFormStage[];
  onComplete: () => void;
}) {
  const { updateUser, user } = useAuthContext();
  const route = usePathname();
  const lastTrackedStageRef = useRef<number | null>(null);

  // Derive current stage from user data to persist across remounts
  const getCurrentStage = (): number => {
    if (!user || !stages || stages.length === 0) return 0;
    
    // Check which stages have been completed
    if (!user.demographic?.gender) return 0;
    if (!user.demographic?.age) return 1;
    if (!user.demographic?.gambling?.ageStarted) return 2;
    if (!user.demographic?.gambling?.frequency) return 3;
    if (!user.demographic?.gambling?.monthlySpend) return 4;
    if (!user.demographic?.gambling?.estimatedLifetimeLoss) return 5;
    
    // All stages complete - return the last valid index
    // Don't return stages.length as that's out of bounds!
    return Math.min(stages.length - 1, 5);
  };

  const [stage, setStage] = useState(() => {
    const initialStage = getCurrentStage();
    // If all stages are complete, we should have already moved on
    // But handle the edge case where we're still on this screen
    return Math.min(initialStage, stages.length - 1);
  });

  // Check if all stages are complete
  useEffect(() => {
    if (!user || !stages || stages.length === 0) return;
    
    const currentStageFromData = getCurrentStage();
    const allComplete = 
      user.demographic?.gender &&
      user.demographic?.age &&
      user.demographic?.gambling?.ageStarted &&
      user.demographic?.gambling?.frequency &&
      user.demographic?.gambling?.monthlySpend &&
      user.demographic?.gambling?.estimatedLifetimeLoss;
    
    // If all stages are complete, call onComplete
    if (allComplete && currentStageFromData >= stages.length - 1) {
      onComplete();
      return;
    }
    
    // Only update if we're not ahead of where we should be
    // And ensure we don't go out of bounds
    if (currentStageFromData > stage && currentStageFromData < stages.length) {
      setStage(currentStageFromData);
    }
  }, [user?.demographic, stages.length]);

  // Track exactly once per stage change (do not re-fire on route changes)
  useEffect(() => {
    if (lastTrackedStageRef.current === stage) return;
    lastTrackedStageRef.current = stage;
    const info = mapOnboardingFormStageToStep(stage);
    if (info) {
      trackOnboardingStepView({ ...info, route: route ?? "/onboarding" });
    }
  }, [stage]);

  const nextStage = () => {
    if (stage >= stages.length - 1) {
      onComplete();
    } else {
      setStage(stage + 1);
    }
  };

  const onPress = async (value: string | Range) => {
    // Add bounds checking
    if (!stages[stage]?.key) {
      console.error(`Invalid stage index: ${stage}, stages length: ${stages.length}`);
      return;
    }
    
    if (stages[stage].key) {
      await updateUser(stages[stage].key, value);

      // Check if this is the monthly spend question
      if (stages[stage].key === "demographic.gambling.monthlySpend") {
        // Get the max value (if value is a Range, use value.max; if number, use value)
        const max =
          typeof value === "object" && "max" in value ? value.max : value;

        // 1. Calculate spendMeta
        const spendMeta = deriveSpendMeta(Number(max));

        // 2. Save spendMeta to Firestore

        if (user?.uid) {
          await setDoc(
            doc(db, "users", user.uid),
            { spendMeta },
            { merge: true },
          );
        }
      }
    }
    nextStage();
  };

  // Add safety check before rendering
  if (!stages || stages.length === 0) {
    return null; // or a loading/error state
  }

  // Ensure stage is within bounds
  const safeStage = Math.min(Math.max(0, stage), stages.length - 1);
  const currentStage = stages[safeStage];
  
  if (!currentStage) {
    console.error(`Invalid stage: ${safeStage}, stages:`, stages);
    return null; // or a loading/error state
  }

  return (
    <OnboardingLayout
      progress={(safeStage + 1) / (stages.length + 1)}
      title={`Question ${safeStage + 1}`}
      onBack={safeStage > 0 ? () => setStage(safeStage - 1) : undefined}
    >
      <Text variant="h2" className="mb-2 text-center min-h-[60px]">
        {currentStage.title}
      </Text>

      {currentStage.subtitle && (
        <Text variant="p" muted className="mb-2 text-center">
          {currentStage.subtitle}
        </Text>
      )}

      {currentStage.options?.map((option) => (
        <Button
          key={JSON.stringify(option.value)}
          variant="secondary"
          text={option.label}
          iconL={option.iconL}
          onPress={async () => {
            await option.onPress?.(option.value);
            onPress(option.value);
          }}
          flexText={option.flexText}
        />
      ))}

      {currentStage.inputs?.map((input) => (
        <Input
          key={input.value}
          placeholder={input.placeholder}
          keyboardType={input.type}
          onBlur={(text) => {
            if (currentStage.key) {
              updateUser(currentStage.key, parseFloat(text ?? "0"));
            }
          }}
        />
      ))}

      {currentStage.inputs && <Button text="Continue" onPress={nextStage} />}
    </OnboardingLayout>
  );
}
