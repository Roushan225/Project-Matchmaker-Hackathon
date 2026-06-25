"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents, SmartNotification } from "@project-matchmaker/shared";

type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type NotificationInbox = {
  notifications: SmartNotification[];
  unreadCount: number;
};

function notificationTone(kind: SmartNotification["kind"]) {
  if (kind === "invitation") return "border-violet-300/25 bg-violet-300/10 text-violet-100";
  if (kind === "application") return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  if (kind === "request-update") return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  return "border-white/15 bg-white/10 text-indigo-100";
}

export function SmartNotifications({
  copilotOpen,
  copilotWidth,
}: {
  copilotOpen: boolean;
  copilotWidth: number;
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState("Loading notifications…");
  const socketRef = useRef<RealtimeSocket | null>(null);

  async function refresh() {
    const response = await fetch("/api/notifications", { cache: "no-store" });
    const data = await response.json().catch(() => ({})) as Partial<NotificationInbox> & { error?: string };
    if (!response.ok) throw new Error(data.error ?? "Could not load notifications.");
    setNotifications(data.notifications ?? []);
    setUnreadCount(data.unreadCount ?? 0);
    setStatus("Synced");
  }

  async function markRead(notificationId?: string) {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
    const data = await response.json().catch(() => ({})) as Partial<NotificationInbox> & { error?: string };
    if (!response.ok) throw new Error(data.error ?? "Could not update notifications.");
    setNotifications(data.notifications ?? []);
    setUnreadCount(data.unreadCount ?? 0);
  }

  useEffect(() => {
    let cancelled = false;
    void refresh().catch((error) => {
      if (!cancelled) setStatus(error instanceof Error ? error.message : "Could not load notifications.");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let socket: RealtimeSocket | null = null;

    async function connect() {
      try {
        const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;
        if (!realtimeUrl) {
          setStatus("Realtime notifications not configured");
          return;
        }
        const ticketResponse = await fetch("/api/realtime/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scope: "notifications" }),
        });
        const ticketData = await ticketResponse.json().catch(() => ({}));
        if (!ticketResponse.ok) throw new Error(ticketData.error ?? "Could not create notification ticket.");

        socket = io(realtimeUrl, { auth: { token: ticketData.token }, transports: ["websocket"] });
        socketRef.current = socket;
        socket.on("connect", () => setStatus("Live"));
        socket.on("notification:new", (notification) => {
          setNotifications((current) => [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, 20));
          setUnreadCount((current) => current + (notification.read ? 0 : 1));
          setStatus("New notification");
        });
        socket.on("connect_error", () => setStatus("Realtime offline"));
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "Realtime offline");
      }
    }

    void connect();
    return () => {
      cancelled = true;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <div
      className="fixed right-20 top-5 z-40 transition-transform duration-300 ease-out md:right-24 md:top-8"
      style={{
        transform: copilotOpen ? `translateX(-${copilotWidth}px)` : undefined,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative grid h-12 w-12 place-items-center rounded-2xl border border-violet-200/30 bg-indigo-950 text-violet-100 shadow-xl shadow-indigo-950/40 transition hover:scale-105 hover:bg-violet-700"
        aria-label="Open notifications"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
        >
          <path
            d="M15.5 17h-7a2 2 0 0 1-1.82-2.83l.47-1.04A5.5 5.5 0 0 0 7.6 10.85V9.5a4.4 4.4 0 0 1 8.8 0v1.35c0 .79.16 1.57.48 2.29l.46 1.03A2 2 0 0 1 15.5 17Z"
            className="stroke-current"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="M10 19a2.15 2.15 0 0 0 4 0"
            className="stroke-current"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <path
            d="M12 4.8V3.5"
            className="stroke-current"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-400 px-1 text-[10px] font-bold text-white ring-2 ring-indigo-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="absolute right-0 mt-3 w-[min(92vw,23rem)] overflow-hidden rounded-3xl border border-white/15 bg-[#0d0637] shadow-2xl shadow-black/50">
          <header className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">Smart notifications</p>
              <p className="mt-1 text-sm text-indigo-100/55">{status}</p>
            </div>
            <button
              type="button"
              onClick={() => void markRead().catch((error) => setStatus(error instanceof Error ? error.message : "Could not update notifications."))}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-indigo-100/70 transition hover:bg-white/10 hover:text-white"
            >
              Mark all read
            </button>
          </header>
          <div className="max-h-[28rem] overflow-y-auto p-3">
            {notifications.map((notification) => {
              const card = (
                <article className={`rounded-2xl border p-3 transition hover:bg-white/[0.08] ${notificationTone(notification.kind)} ${notification.read ? "opacity-70" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{notification.title}</p>
                      <p className="mt-1 text-xs leading-5 text-indigo-100/65">{notification.body}</p>
                    </div>
                    {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-300" />}
                  </div>
                  <p className="mt-2 text-[11px] text-indigo-100/40">{new Date(notification.createdAt).toLocaleString()}</p>
                </article>
              );

              return notification.href ? (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => void markRead(notification.id).catch(() => undefined)}
                  className="mb-2 block"
                >
                  {card}
                </Link>
              ) : (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void markRead(notification.id).catch(() => undefined)}
                  className="mb-2 block w-full text-left"
                >
                  {card}
                </button>
              );
            })}
            {!notifications.length && (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-indigo-100/50">
                No notifications yet.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
