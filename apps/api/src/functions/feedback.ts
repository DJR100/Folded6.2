import { HttpsError, onCall } from "firebase-functions/v2/https";
import type { CallableRequest } from "firebase-functions/v2/https";

import { db } from "@/common/firebase";

export const submit = onCall(
  { region: "us-central1" }, // match the client
  async (
    request: CallableRequest<{
      type: "bug" | "general" | "feature";
      payload: Record<string, any>;
    }>,
  ) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Sign-in required");

    const { type, payload } = request.data;
    await db.collection("feedback").add({
      type,
      ...payload,
      userId: uid,
      createdAt: Date.now(),
    });

    return { ok: true };
  },
);
