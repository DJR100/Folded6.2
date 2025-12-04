import "dotenv/config";
import type { ExpoConfig } from "@expo/config";

export default ({ config }: { config: ExpoConfig }) => {
  const env = process.env.ENVIRONMENT ?? "development";
  const tokens = {
    development: process.env.MIXPANEL_DEV_TOKEN,
    production: process.env.MIXPANEL_PROD_TOKEN,
  } as const;

  return {
    ...config,
    name: "Folded",
    slug: "my-app",
    version: "1.0.6",
    orientation: "portrait",
    icon: "./src/assets/images/folded_icon_11.25.png",
    scheme: "folded",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.folded.so",
      buildNumber: "29",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          "Allow Folded to use the camera to customise your profile and complete daily challenges. Folded only reads the photos you select.",
        NSPhotoLibraryUsageDescription:
          "Allow Folded to access your photos to customise your profile and complete daily challenges. Folded only reads the photos you select.",
        NSLocationWhenInUseUsageDescription:
          "Folded does not use your location. If iOS asks, you can safely deny and continue.",
        UIDeviceFamily: [1],
        LSApplicationQueriesSchemes: ["whatsapp", "whatsapp-messenger"],
      },
      googleServicesFile: "./GoogleService-Info.plist",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      versionCode: 12,
      edgeToEdgeEnabled: true,
      permissions: ["android.permission.CAMERA"],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/folded_icon_11.25.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./src/assets/images/folded_icon_11.25.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow Folded to access your photos to customise your profile and complete daily challenges. Folded only reads the photos you select.",
        },
      ],
      [
        "react-native-vision-camera",
        {
          cameraPermissionText:
            "Allow Folded to use the camera to customise your profile and complete daily challenges. Folded only reads the photos you select.",
          enableMicrophonePermission: false,
        },
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/messaging",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
      "expo-notifications",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "59b4e062-092d-4a71-832c-909890838a69",
      },
      environment: env,
      mixpanelToken: tokens[env as keyof typeof tokens],
      mixpanelServerURL: "https://api-eu.mixpanel.com",
    },
    owner: "djr_100",
    runtimeVersion: "1.0.1",
    updates: {
      url: "https://u.expo.dev/59b4e062-092d-4a71-832c-909890838a69",
    },
  } as ExpoConfig;
};


