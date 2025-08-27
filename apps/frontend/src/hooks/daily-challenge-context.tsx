import { DailyChallengeContextValue } from "@folded/types";
import React, {
  type PropsWithChildren,
  createContext,
  useContext,
} from "react";

import { useDailyChallenge } from "./use-daily-challenge";

// Create the context
const DailyChallengeContext = createContext<DailyChallengeContextValue | null>(
  null,
);

// Provider component
export function DailyChallengeProvider({ children }: PropsWithChildren) {
  const dailyChallengeValue = useDailyChallenge(); // This is correct - use the hook

  return (
    <DailyChallengeContext.Provider value={dailyChallengeValue}>
      {children}
    </DailyChallengeContext.Provider>
  );
}

// Custom hook to consume the context
export function useDailyChallengeContext(): DailyChallengeContextValue {
  const context = useContext(DailyChallengeContext);

  if (!context) {
    throw new Error(
      "useDailyChallengeContext must be used within a DailyChallengeProvider",
    );
  }

  return context;
}

// Export context for advanced use cases (optional)
export { DailyChallengeContext };
