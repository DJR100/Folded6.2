import {
  addDoc,
  collection,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { auth } from "@/hooks/use-auth-context";
import { db } from "@/lib/firebase";

type EventParams = Record<string, any> | undefined;

export async function logEvent(name: string, params?: EventParams) {
  try {
    await addDoc(collection(db, "events"), {
      name,
      params: params ?? {},
      userId: auth.currentUser?.uid ?? null,
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version ?? null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Non-blocking: analytics failures should not impact UX
    console.warn("logEvent failed:", error);
  }
}
