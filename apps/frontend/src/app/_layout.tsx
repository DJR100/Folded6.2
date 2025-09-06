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

export default function Root() {
  const fontsLoaded = useFontLoad();
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
