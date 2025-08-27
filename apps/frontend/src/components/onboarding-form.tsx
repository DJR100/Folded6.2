import { Range } from "@folded/types";
import { doc, setDoc } from "@react-native-firebase/firestore";
import React, { useState } from "react";

import { OnboardingLayout } from "@/components/layouts/onboarding";
import { Button, Input, Text } from "@/components/ui";
import { useAuthContext } from "@/hooks/use-auth-context";
import { db } from "@/lib/firebase";
import { deriveSpendMeta } from "@/lib/moneysaved";

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
  const { updateUser } = useAuthContext();
  const [stage, setStage] = useState(0);

  const nextStage = () => {
    if (stage === stages.length - 1) {
      onComplete();
    } else {
      setStage(stage + 1);
    }
  };

  const { user } = useAuthContext();
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
