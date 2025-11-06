import { Platform } from "react-native";
import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "review_prompt_state_v1";
const DAY_MS = 24 * 60 * 60 * 1000;

type Reason =
  | "onboarding_7"
  | "onboarding_complete"
  | "purchase_success"
  | "daily_challenge_win"
  | "analysis_complete"; // added for analysis screen

type PromptState = {
  lastPromptAt?: number;
  timesPrompted?: number;
};

async function loadState(): Promise<PromptState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveState(s: PromptState) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

export async function maybeAskForReview(_reason: Reason) {
  // iOS only, device/TestFlight/App Store builds. Apple throttles display itself.
  if (Platform.OS !== "ios") return;
  if (__DEV__) return;

  const available = await StoreReview.isAvailableAsync();
  if (!available) return;

  const state = await loadState();
  const now = Date.now();
  const times = state.timesPrompted ?? 0;
  const last = state.lastPromptAt ?? 0;

  // Heuristics: at most 3 lifetime prompts; at least 14 days between attempts
  if (times >= 3) return;
  if (now - last < 14 * DAY_MS) return;

  try {
    await StoreReview.requestReview();
    await saveState({ timesPrompted: times + 1, lastPromptAt: now });
  } catch {
    // No-op
  }
}


