import type { SmartNotification, SmartNotificationKind } from "@project-matchmaker/shared";
import { ensureIndexes } from "../db/indexes";
import { countUnreadSmartNotifications, createSmartNotification, listSmartNotifications, markAllSmartNotificationsRead, markSmartNotificationRead } from "../repositories/notifications";

type NotificationInput = {
  userId: string;
  kind: SmartNotificationKind;
  title: string;
  body: string;
  href?: string;
};

async function publishRealtimeNotification(notification: SmartNotification) {
  const realtimeUrl = process.env.REALTIME_SERVER_URL ?? process.env.NEXT_PUBLIC_REALTIME_URL;
  const secret = process.env.SOCKET_TOKEN_SECRET;
  if (!realtimeUrl || !secret) return;

  try {
    await fetch(`${realtimeUrl.replace(/\/$/, "")}/notify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: notification.userId, notification }),
      cache: "no-store",
    });
  } catch {
    // Persisted notifications are still available on refresh if realtime publish fails.
  }
}

export async function notifyUser(input: NotificationInput) {
  await ensureIndexes();
  const notification = await createSmartNotification({
    userId: input.userId,
    kind: input.kind,
    title: input.title,
    body: input.body,
    href: input.href,
    read: false,
    createdAt: new Date(),
  });
  await publishRealtimeNotification(notification);
  return notification;
}

export async function getSmartNotificationInbox(userId: string) {
  const [notifications, unreadCount] = await Promise.all([
    listSmartNotifications(userId),
    countUnreadSmartNotifications(userId),
  ]);
  return { notifications, unreadCount };
}

export async function markSmartNotification(userId: string, notificationId?: string) {
  if (notificationId) await markSmartNotificationRead(notificationId, userId);
  else await markAllSmartNotificationsRead(userId);
  return getSmartNotificationInbox(userId);
}
