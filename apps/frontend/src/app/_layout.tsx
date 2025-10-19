import { PortalHost, PortalProvider } from "@gorhom/portal";
import { Slot } from "expo-router";
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
import { useEffect } from "react";
import Purchases from "react-native-purchases";

export default function Root() {
  const fontsLoaded = useFontLoad();
  if (!fontsLoaded) return null;

  // Initialize RevenueCat Purchases SDK
  useEffect(() => {
    const key = process.env.EXPO_PUBLIC_RC_IOS_KEY;
    if (!key) {
      if (__DEV__) console.warn("Missing EXPO_PUBLIC_RC_IOS_KEY");
      return;
    }
    Purchases.configure({ apiKey: key });
  }, []);

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
