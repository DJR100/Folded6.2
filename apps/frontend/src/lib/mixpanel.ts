import { Mixpanel } from "mixpanel-react-native";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Resolve config from multiple sources to be robust across Expo SDKs
const extra =
  (Constants.expoConfig?.extra as any) ||
  // SDK 49/50 manifest2 shape
  ((Constants as any).manifest2?.extra?.expoClient?.extra as any) ||
  // Older SDK manifest shape
  ((Constants as any).manifest?.extra as any) ||
  {};

const token = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || extra?.mixpanelToken;
const serverURL =
  process.env.EXPO_PUBLIC_MIXPANEL_SERVER_URL ||
  extra?.mixpanelServerURL ||
  "https://api.mixpanel.com";

if (!token && __DEV__) {
  console.warn(
    "Missing Mixpanel token: set EXPO_PUBLIC_MIXPANEL_TOKEN or expo.extra.mixpanelToken",
  );
}

export const mixpanel = new Mixpanel(
  token ?? "MISSING_TOKEN",
  false, // trackAutomaticEvents (legacy mobile autotrack disabled)
  true, // useNative mode (matches app's native modules)
);

let initialized = false;
export async function initMixpanel() {
  if (initialized) return;
  const superProps = {
    app_version: Constants.expoConfig?.version ?? null,
    platform: Platform.OS,
    env: __DEV__ ? "dev" : "prod",
    data_source: "MP-React",
  } as Record<string, any>;

  await mixpanel.init(
    false, // optOutTrackingDefault
    superProps,
    serverURL,
  );
  // Ensure server URL is set in case instance was restored from cache or init didn't set
  try {
    mixpanel.setServerURL(serverURL);
  } catch {}
  mixpanel.setLoggingEnabled(__DEV__);
  // Privacy: disable IP-based geolocation enrichment
  mixpanel.setUseIpAddressForGeolocation(false);
  if (__DEV__) {
    console.log("Mixpanel initialized", {
      tokenPresent: !!token,
      serverURL,
    });
  }
  initialized = true;
}

export function track(name: string, props?: Record<string, any>) {
  mixpanel.track(name, props);
}


