import { Transaction } from "./banking";

export type Notification = RelapseNotification;

export interface RelapseNotification extends NotificationBase {
  type: NotificationType.RELAPSE;
  data: {
    value: number;
    transactions: Transaction[];
  };
}

interface NotificationBase {
  notificationId: string;
  type: NotificationType;
  createdAt: number;
  viewedAt?: number;
}

export enum NotificationType {
  RELAPSE = "relapse",
}
