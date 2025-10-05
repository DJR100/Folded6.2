import messaging from "@react-native-firebase/messaging";
import * as Device from "expo-device";
// import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { api } from "./firebase";

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      if (!token) return;
      await api({
        endpoint: "notifications-updateToken",
        data: { token },
      });
      setExpoPushToken(token);
    });

    messaging().onMessage(async (remoteMessage) => {
      if (__DEV__) console.log("Message received", remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title ?? "",
        remoteMessage.notification?.body ?? "",
      );
    });

    // Background/quit state (Android)
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      if (__DEV__)
        console.log("Message handled in the background!", remoteMessage);
    });
  }, []);

  return { expoPushToken };
};

export const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) {
    alert("Must use physical device for Push Notifications");
    return;
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    if (__DEV__) console.log("Permission not granted");
    return;
  }

  const token = await messaging().getToken();
  if (__DEV__) console.log("FCM Token:", token);
  return token;
};
