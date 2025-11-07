import { track } from "@/lib/mixpanel";

type StepInfo = {
  step_key: string;
  step_index: number;
  screen_group: string;
};

// Mapping of router path → onboarding step
export function mapPathToOnboardingStep(pathname: string): StepInfo | null {
  // Normalize trailing slash
  const path = pathname.replace(/\/$/, "");

  // Ordered mapping based on the flow agreed with the team
  const map: Record<string, StepInfo> = {
    "/": { step_key: "landing", step_index: 1, screen_group: "onboarding" },
    "/auth/sign-in": {
      step_key: "auth_sign_in",
      step_index: 2,
      screen_group: "onboarding",
    },
    "/auth/create-account": {
      step_key: "auth_create_account",
      step_index: 2,
      screen_group: "onboarding",
    },
    "/onboarding/1": {
      step_key: "calculation",
      step_index: 9,
      screen_group: "onboarding",
    },
    "/onboarding/2": {
      step_key: "analysis_complete",
      step_index: 10,
      screen_group: "onboarding",
    },
    "/onboarding/recovery-progress": {
      step_key: "recovery_progress",
      step_index: 11,
      screen_group: "onboarding",
    },
    "/onboarding/4": {
      step_key: "motivation",
      step_index: 12,
      screen_group: "onboarding",
    },
    "/onboarding/6": {
      step_key: "testimonials",
      step_index: 13,
      screen_group: "onboarding",
    },
    "/onboarding/7": {
      step_key: "pre_paywall",
      step_index: 14,
      screen_group: "onboarding",
    },
    "/post-onboarding": {
      step_key: "pre_dashboard",
      step_index: 15,
      screen_group: "onboarding",
    },
  };

  return map[path] ?? null;
}

// Mapping for stages inside the form on /onboarding
export function mapOnboardingFormStageToStep(stage: number): StepInfo | null {
  const stages: StepInfo[] = [
    { step_key: "gender", step_index: 3, screen_group: "onboarding" },
    { step_key: "age", step_index: 4, screen_group: "onboarding" },
    {
      step_key: "first_gamble_age",
      step_index: 5,
      screen_group: "onboarding",
    },
    { step_key: "frequency", step_index: 6, screen_group: "onboarding" },
    {
      step_key: "monthly_spend",
      step_index: 7,
      screen_group: "onboarding",
    },
    {
      step_key: "total_losses",
      step_index: 8,
      screen_group: "onboarding",
    },
  ];
  return stages[stage] ?? null;
}

export function trackOnboardingStepView(props: StepInfo & { route: string }) {
  track("onboarding_step_viewed", {
    step_key: props.step_key,
    step_index: props.step_index,
    route: props.route,
    screen_group: props.screen_group,
  });
}
