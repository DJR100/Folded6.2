import { PortalHost, PortalProvider } from "@gorhom/portal";
import { Slot, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import "../global.css";

// Silence console logs in production builds
if (!__DEV__) {
  const noop = () => {};
  // Preserve console.error for error reporting
  console.log = noop;
  console.info = noop;
  console.warn = noop;
}

import { View } from "@/components/ui";
import { AuthContextProvider } from "@/hooks/use-auth-context";
import { useFontLoad } from "@/hooks/use-font-load";
import { useEffect, useRef } from "react";
import Purchases from "react-native-purchases";
import { initMixpanel, track, mixpanel } from "@/lib/mixpanel";
import {
  mapPathToOnboardingStep,
  trackOnboardingStepView,
} from "@/lib/funnel";

export default function Root() {
  const fontsLoaded = useFontLoad();
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);
  const lastTsRef = useRef<number>(0);

  // Initialize RevenueCat Purchases SDK (keep hook order stable; guard on fontsLoaded)
  useEffect(() => {
    if (!fontsLoaded) return;
    const key = process.env.EXPO_PUBLIC_RC_IOS_KEY;
    if (!key) {
      if (__DEV__) console.warn("Missing EXPO_PUBLIC_RC_IOS_KEY");
      return;
    }
    Purchases.configure({ apiKey: key });
  }, [fontsLoaded]);

  // Initialize Mixpanel and send app_open
  useEffect(() => {
    if (!fontsLoaded) return;
    (async () => {
      await initMixpanel();
      track("app_open", { launch_type: "cold" });
      mixpanel.flush();
    })();
  }, [fontsLoaded]);

  // Global route focus tracking for onboarding steps outside the form
  useEffect(() => {
    if (!fontsLoaded) return;
    if (!pathname) return;
    const now = Date.now();
    // Debounce identical rapid transitions
    if (lastPathRef.current === pathname && now - lastTsRef.current < 400) {
      return;
    }
    lastPathRef.current = pathname;
    lastTsRef.current = now;

    const step = mapPathToOnboardingStep(pathname);
    if (step) {
      trackOnboardingStepView({ ...step, route: pathname });
    }
  }, [fontsLoaded, pathname]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView>
      <PortalProvider>
        <AuthContextProvider>
          <View className="flex-1 bg-background">
            <SafeAreaView className="flex-1">
              <Slot />
              <StatusBar style="light" translucent />
              <PortalHost name="bottom-sheet" />
            </SafeAreaView>
          </View>
        </AuthContextProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  );
}
