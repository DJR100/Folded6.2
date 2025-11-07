import { Mixpanel } from "mixpanel-react-native";
import Constants from "expo-constants";
import { Platform } from "react-native";

const token =
  process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ||
  // Fallback to app.json extra
  (Constants.expoConfig?.extra as any)?.mixpanelToken;

if (!token && __DEV__) {
  console.warn(
    "Missing Mixpanel token: set EXPO_PUBLIC_MIXPANEL_TOKEN or expo.extra.mixpanelToken",
  );
}

export const mixpanel = new Mixpanel(
  token ?? "MISSING_TOKEN",
  false, // trackAutomaticEvents (legacy mobile autotrack disabled)
  true, // useNative mode (matches app's native modules)
  "https://api.mixpanel.com",
  false, // optOutTrackingDefault
  {
    app_version: Constants.expoConfig?.version ?? null,
    platform: Platform.OS,
    env: __DEV__ ? "dev" : "prod",
    data_source: "MP-React",
  },
);

let initialized = false;
export async function initMixpanel() {
  if (initialized) return;
  await mixpanel.init();
  mixpanel.setLoggingEnabled(__DEV__);
  // Privacy: disable IP-based geolocation enrichment
  mixpanel.setUseIpAddressForGeolocation(false);
  initialized = true;
}

export function track(name: string, props?: Record<string, any>) {
  mixpanel.track(name, props);
}


