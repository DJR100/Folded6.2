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
    if (!user) return 0;
    
    // Check which stages have been completed
    if (!user.demographic?.gender) return 0;
    if (!user.demographic?.age) return 1;
    if (!user.demographic?.gambling?.ageStarted) return 2;
    if (!user.demographic?.gambling?.frequency) return 3;
    if (!user.demographic?.gambling?.monthlySpend) return 4;
    if (!user.demographic?.gambling?.estimatedLifetimeLoss) return 5;
    
    // All stages complete
    return stages.length;
  };

  const [stage, setStage] = useState(() => getCurrentStage());

  // Update stage when user data changes (but don't go backwards)
  useEffect(() => {
    const currentStageFromData = getCurrentStage();
    // Only update if we're not ahead of where we should be
    // This prevents going backwards when user data updates
    if (currentStageFromData > stage) {
      setStage(currentStageFromData);
    }
  }, [user?.demographic]);

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

  return (
    <OnboardingLayout
      progress={(stage + 1) / (stages.length + 1)}
      title={`Question ${stage + 1}`}
      onBack={stage > 0 ? () => setStage(stage - 1) : undefined}
    >
      <Text variant="h2" className="mb-2 text-center min-h-[60px]">
        {stages[stage].title}
      </Text>

      {stages[stage].subtitle && (
        <Text variant="p" muted className="mb-2 text-center">
          {stages[stage].subtitle}
        </Text>
      )}

      {stages[stage].options?.map((option) => (
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

      {stages[stage].inputs?.map((input) => (
        <Input
          key={input.value}
          placeholder={input.placeholder}
          keyboardType={input.type}
          onBlur={(text) => {
            if (stages[stage].key) {
              updateUser(stages[stage].key, parseFloat(text ?? "0"));
            }
          }}
        />
      ))}

      {stages[stage].inputs && <Button text="Continue" onPress={nextStage} />}
    </OnboardingLayout>
  );
}
