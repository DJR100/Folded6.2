import { router } from "expo-router";
import React from "react";

import OnboardingForm, {
  OnboardingFormStage,
} from "@/components/onboarding-form";
import { useAuthContext } from "@/hooks/use-auth-context";

const stages: OnboardingFormStage[] = [
  {
    title: "What is your gender?",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "non-binary", label: "Non-binary" },
    ],
    key: "demographic.gender",
  },
  {
    title: "How old are you?",
    options: [
      { value: { min: 18, max: 24 }, label: "18-24" },
      { value: { min: 25, max: 34 }, label: "25-34" },
      { value: { min: 35, max: 44 }, label: "35-44" },
      { value: { min: 45, max: 54 }, label: "45-54" },
      { value: { min: 55, max: 64 }, label: "55-64" },
      { value: { min: 65, max: 100 }, label: "65+" },
    ],
    key: "demographic.age",
  },
  {
    title: "How old were you when you started gambling?",
    options: [
      { value: { min: 12, max: 18 }, label: "12-18" },
      { value: { min: 18, max: 24 }, label: "18-24" },
      { value: { min: 25, max: 34 }, label: "25-34" },
      { value: { min: 35, max: 44 }, label: "35-44" },
      { value: { min: 45, max: 54 }, label: "45-54" },
      { value: { min: 55, max: 64 }, label: "55-64" },
      { value: { min: 65, max: 100 }, label: "65+" },
    ],
    key: "demographic.gambling.ageStarted",
  },
  {
    title: "How often do you gamble?",
    options: [
      { value: "multiple-times-a-day", label: "Multiple times a day" },
      { value: "daily", label: "Once a day" },
      { value: "weekly", label: "Once a week" },
      { value: "monthly", label: "Once a month" },
    ],
    key: "demographic.gambling.frequency",
  },
  {
    title: "How much do you spend on gambling each month?",
    options: [
      { value: { min: 0, max: 150 }, label: "Less than $150" },
      { value: { min: 150, max: 250 }, label: "$150 - $250" },
      { value: { min: 250, max: 500 }, label: "$250 - $500" },
      { value: { min: 500, max: 1000 }, label: "$500 - $1000" },
      { value: { min: 1000, max: 2000 }, label: "$1000 - $2000" },
      { value: { min: 2000, max: 10000 }, label: "More than $2000" },
    ],
    key: "demographic.gambling.monthlySpend",
  },
  {
    title: "How much do you think you've lost gambling in your life?",
    inputs: [
      {
        placeholder: "$100",
        value: "",
        type: "numeric",
      },
    ],
    key: "demographic.gambling.estimatedLifetimeLoss",
  },
];

export default function Onboarding() {
  const { setOnboarding } = useAuthContext();

  const onComplete = () => {
    setOnboarding(1);
    router.push("/onboarding/1");
  };

  return <OnboardingForm stages={stages} onComplete={onComplete} />;
}
