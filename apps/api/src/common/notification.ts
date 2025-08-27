import { Notification, User } from "@folded/types";
import { Message, getMessaging } from "firebase-admin/messaging";

import { db } from "./firebase";

export const createNotification = async (
  userId: string,
  notification: Notification,
) => {
  // Create the notification in database
  await db
    .collection("users")
    .doc(userId)
    .collection("notifications")
    .add(notification);

  // Send push notification to the user
  await sendPushNotification(userId);
};

const sendPushNotification = async (userId: string) => {
  const token = await db
    .collection("users")
    .doc(userId)
    .get()
    .then((doc) => (doc.data() as User | undefined)?.messaging?.token);

  if (!token) return;

  const message: Message = {
    token,
    notification: {
      title: "Hello!",
      body: "You've got a new message!",
    },
    data: {
      customDataKey: "value",
    },
  };

  const messaging = getMessaging();

  try {
    await messaging.send(message);
  } catch (error) {
    console.error(error);
    // If failed to send, delete the token, it is no longer valid
    await db
      .collection("users")
      .doc(userId)
      .update({ messaging: { token: null, createdAt: null } });
  }
};
