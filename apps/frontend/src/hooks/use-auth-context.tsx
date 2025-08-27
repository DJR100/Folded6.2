import { DailyChallengeData, User } from "@folded/types";
import {
  createUserWithEmailAndPassword,
  initializeAuth,
  signInWithEmailAndPassword,
  signOut as signOutFirebase,
} from "@react-native-firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "@react-native-firebase/firestore";
import _ from "lodash";
import {
  type PropsWithChildren,
  createContext,
  use,
  useEffect,
  useState,
} from "react";

import { app, db } from "@/lib/firebase";

export const auth = initializeAuth(app);

interface AuthContext {
  user: User | null | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  onboarding: number | "DONE";
  setOnboarding: React.Dispatch<React.SetStateAction<number | "DONE">>;
  postOnboarding: 0 | 1 | 2 | 3 | "DONE";
  setPostOnboarding: React.Dispatch<
    React.SetStateAction<0 | 1 | 2 | 3 | "DONE">
  >;
  // COMMENTED OUT FOR V1 - Bank connection not required
  // bankConnected: boolean;
  // setBankConnected: React.Dispatch<React.SetStateAction<boolean>>;
  updateUser: (dotkey: string, value: any) => Promise<void>;
}

const AuthContext = createContext<AuthContext>({} as AuthContext);

export function AuthContextProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>();

  // Local state variables - these will be synced with database state
  const [onboarding, setOnboarding] = useState<number | "DONE">(0);
  const [postOnboarding, setPostOnboarding] = useState<0 | 1 | 2 | 3 | "DONE">(
    0,
  );
  // COMMENTED OUT FOR V1 - Bank connection not required
  // const [bankConnected, setBankConnected] = useState<boolean>(false);

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutFirebase(auth);

      // Reset all state
      setUser(null);
      setOnboarding(0);
      setPostOnboarding(0);
      // COMMENTED OUT FOR V1
      // setBankConnected(false);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Initial user loading - this handles the first-time user fetch
  useEffect(() => {
    const readUser = async () => {
      if (!auth.currentUser?.uid) return;

      const user = (
        await getDoc(doc(db, "users", auth.currentUser?.uid))
      ).data() as User | undefined;

      return user;
    };

    const unsubscribeAuthState = auth.onAuthStateChanged(async () => {
      setUser(await readUser());
    });

    return () => {
      unsubscribeAuthState();
    };
  }, []);

  // ✅ THIS IS THE KEY CHANGE - Sync local state with database state
  useEffect(() => {
    if (!user) return;

    // Async function to handle daily challenge migration
    const migrateDailyChallengeData = async () => {
      if (!auth.currentUser?.uid) return;

      if (!user.dailyChallenge) {
        // New user - create with app open tracking
        const defaultDailyChallengeData: DailyChallengeData = {
          streakCount: 0,
          lastCompletedDate: null,
          lastAppOpenDate: null, // NEW field
          currentWeek: [false, false, false, false, false, false, false],
          currentDayState: "pending",
        };
        // Persist default daily challenge data
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          { dailyChallenge: defaultDailyChallengeData },
          { merge: true },
        );
        console.log("✅ Initialized dailyChallenge for new user");
      } else if (!("lastAppOpenDate" in user.dailyChallenge)) {
        // Existing user - add missing field
        const updatedData = {
          ...user.dailyChallenge,
          lastAppOpenDate: null, // Initialize for existing users
        };
        // Persist addition of lastAppOpenDate for existing users
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          { dailyChallenge: updatedData },
          { merge: true },
        );
        console.log(
          "🔧 Added lastAppOpenDate to existing user's dailyChallenge",
        );
      }
    };

    console.log("🔄 Syncing local state with database state...");
    console.log("User tier from database:", user.tier);

    // ✅ STEP 1: Initialize onboarding state based on user's tier from database
    if (user.tier === 0) {
      // User hasn't completed onboarding yet
      console.log("Setting onboarding state to 0 (not complete)");
      setOnboarding(0);
      setPostOnboarding(0);
    } else {
      // User has completed onboarding (tier > 0)
      console.log("Setting onboarding state to DONE (complete)");
      setOnboarding("DONE");
      setPostOnboarding("DONE");
    }

    // ✅ STEP 2: Migrate daily challenge data for existing users
    migrateDailyChallengeData();

    // ✅ STEP 3: Initialize bank connection state (COMMENTED OUT FOR V1)
    // const hasBankConnection = !!user.banking?.accessToken;
    // console.log("Bank connection status from database:", hasBankConnection);
    // setBankConnected(hasBankConnection);

    // ✅ STEP 4: Set up real-time listener for ongoing updates
    const snapshotListener = onSnapshot(
      doc(db, "users", auth.currentUser?.uid ?? ""),
      (doc) => {
        const updatedUser = doc.data() as User | undefined;
        if (!updatedUser) return;

        console.log("📡 Real-time user update received");
        console.log(
          `🔍 Firebase streak.start: ${updatedUser.streak?.start} (${updatedUser.streak?.start ? new Date(updatedUser.streak.start).toISOString() : "undefined"})`,
        );

        setUser(updatedUser);

        // Update local state when database changes in real-time
        if (updatedUser.tier === 0) {
          setOnboarding(0);
          setPostOnboarding(0);
        } else {
          setOnboarding("DONE");
          setPostOnboarding("DONE");
        }
      },
    );

    return () => {
      snapshotListener();
    };
  }, [user?.uid, user?.tier]); // ✅ Also watch user.tier to refresh listener when onboarding completes

  const updateUser = async (dotkey: string, value: any) => {
    if (!user) return;

    const keys = dotkey.split(".");

    // 🎯 CRITICAL FIX: Build update object for merge instead of overwriting entire document
    const updateObject: any = {};
    let current = updateObject;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    console.log(`🔧 updateUser: ${dotkey} =`, value);
    console.log(`📝 Update object:`, updateObject);

    // Use merge: true to avoid overwriting other fields
    await setDoc(doc(db, "users", user.uid), updateObject, { merge: true });

    console.log(`✅ Firebase merge completed for ${dotkey}`);

    // Don't update local state - let the real-time listener handle it
    // This prevents race conditions and ensures we always have the latest data
  };

  const value: AuthContext = {
    user,
    signIn,
    signUp,
    signOut,
    isLoading: user === undefined,
    onboarding,
    setOnboarding,
    postOnboarding,
    setPostOnboarding,
    // COMMENTED OUT FOR V1
    // bankConnected,
    // setBankConnected,
    updateUser,
  };
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuthContext() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error(
      "useAuthContext must be wrapped in a <AuthContextProvider />",
    );
  }
  return value;
}
