import { User } from "@folded/types";
import { getAuth } from "firebase-admin/auth";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { beforeUserCreated as beforeUserCreatedCallback } from "firebase-functions/v2/identity";

import { db } from "../common/firebase";

export const beforeUserCreated = beforeUserCreatedCallback(async (event) => {
  if (!event.data) {
    throw new Error("No user data provided");
  }

  const data = event.data;

  // 🔍 CHECK: See if user already exists (to avoid overwriting recovery progress)
  const existingUserDoc = await db.collection("users").doc(data.uid).get();
  const existingUser = existingUserDoc.data() as User | undefined;

  console.log(`🔧 beforeUserCreated called for ${data.uid}`);
  console.log(`📊 Existing user found: ${!!existingUser}`);
  console.log(`📊 Existing streak.start: ${existingUser?.streak?.start}`);

  const user: User = {
    version: "0.0.0",
    uid: data.uid,
    email: data.email || null,
    displayName: data.displayName || null,
    photoURL: data.photoURL || null,
    createdAt: existingUser?.createdAt || Date.now(), // Preserve existing createdAt
    banking: existingUser?.banking || null,
    tier: existingUser?.tier || 0,
    demographic: existingUser?.demographic || {
      gender: null,
      age: null,
      gambling: {
        frequency: null,
        ageStarted: null,
        monthlySpend: null,
        estimatedLifetimeLoss: null,
      },
    },
    // 🎯 CRITICAL FIX: Preserve existing streak data if it exists (don't overwrite recovery progress!)
    streak: existingUser?.streak || {
      start: Date.now(),
    },
    // 🎯 CRITICAL FIX: Preserve existing daily challenge data
    dailyChallenge: existingUser?.dailyChallenge || {
      streakCount: 0,
      lastCompletedDate: null,
      currentWeek: [false, false, false, false, false, false, false],
      currentDayState: "pending",
    },
    message: existingUser?.message || null,
    guardian: existingUser?.guardian || {
      guardianId: null,
      buddy: {
        userId: null,
      },
    },
    messaging: existingUser?.messaging || {
      token: null,
      createdAt: null,
    },
  };

  console.log(
    `✅ Final streak.start being saved: ${user.streak.start} (${new Date(user.streak.start).toISOString()})`,
  );

  // Create or update user document in Firestore
  await db.collection("users").doc(data.uid).set(user);
});

// Callable: reserve username and set profile fields atomically
export const reserveUsername = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid)
    throw new HttpsError("unauthenticated", "User is not authenticated");

  const { username, firstName } = (request.data || {}) as {
    username?: string;
    firstName?: string | null;
  };
  if (!username || typeof username !== "string") {
    throw new HttpsError("invalid-argument", "username is required");
  }

  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_\.]{3,20}$/.test(normalized)) {
    throw new HttpsError(
      "invalid-argument",
      "username must be 3-20 chars, a-z, 0-9, _ or .",
    );
  }

  await db.runTransaction(async (tx) => {
    const unameRef = db.collection("usernames").doc(normalized);
    const snap = await tx.get(unameRef);

    if (snap.exists && (snap.data() as any)?.uid !== uid) {
      throw new HttpsError("already-exists", "Username is already taken");
    }

    // Reserve/claim the username
    tx.set(unameRef, { uid, createdAt: Date.now() });

    // Update user profile atomically
    const userRef = db.collection("users").doc(uid);
    tx.set(
      userRef,
      {
        displayName: firstName || username,
        profile: {
          username,
          firstName: firstName ?? null,
        },
      },
      { merge: true } as any,
    );
  });

  return { ok: true };
});

export const deleteAccount = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "User is not authenticated");
  }

  // Read current user doc to get username (if any)
  const userSnap = await db.collection("users").doc(uid).get();
  const user = userSnap.data() as any | undefined;

  // 1) Delete user doc
  await db.collection("users").doc(uid).delete();

  // 2) Release reserved username if owned by this user
  const username = user?.profile?.username;
  if (username) {
    const unameRef = db.collection("usernames").doc(username.toLowerCase());
    const unameSnap = await unameRef.get();
    if (unameSnap.exists && (unameSnap.data() as any)?.uid === uid) {
      await unameRef.delete();
    }
  }

  // 3) Delete the Firebase Auth user
  await getAuth().deleteUser(uid);

  return { ok: true };
});
