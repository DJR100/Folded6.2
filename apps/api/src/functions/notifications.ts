import { HttpsError, onCall } from "firebase-functions/v2/https";

import { db } from "@/common/firebase";

export const updateToken = onCall(async (request) => {
  // Get uid
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "User is not authenticated");
  }

  // Get token
  const token = request.data.token;
  if (!token) {
    throw new HttpsError("invalid-argument", "Token is required");
  }

  // Update user's token
  await db
    .collection("users")
    .doc(uid)
    .update({ messaging: { token, createdAt: Date.now() } });

  return 200;
});
