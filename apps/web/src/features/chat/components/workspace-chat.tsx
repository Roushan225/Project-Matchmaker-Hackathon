"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage, ClientToServerEvents, ServerToClientEvents } from "@project-matchmaker/shared";
import type { WorkspaceMember } from "@/features/tasks/components/workspace-task-board";

type ChatChannel = "team" | "discussion";
type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function WorkspaceChat({ projectId, currentUserId, members, channel = "discussion" }: { projectId: string; currentUserId: string; members: WorkspaceMember[]; channel?: ChatChannel }) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<RealtimeSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Loading messages…");
  const [liveState, setLiveState] = useState<"off" | "connecting" | "live" | "error">(channel === "team" ? "connecting" : "off");
  const isTeamChat = channel === "team";
  const memberMap = new Map(members.map((member) => [member.id, member]));

  async function loadMessages() {
    setStatus("Refreshing…");
    const response = await fetch(`/api/messages?projectId=${encodeURIComponent(projectId)}&channel=${channel}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) { setStatus(data.error ?? "Chat is unavailable."); return; }
    setMessages(data.messages);
    setStatus(isTeamChat ? "Live chat ready" : "Synced");
  }

  useEffect(() => {
    let cancelled = false;
    async function hydrateMessages() {
      try {
        const response = await fetch(`/api/messages?projectId=${encodeURIComponent(projectId)}&channel=${channel}`, { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) { setStatus(data.error ?? "Chat is unavailable."); return; }
        setMessages(data.messages);
        setStatus(isTeamChat ? "Live chat ready" : "Synced");
      } catch {
        if (!cancelled) setStatus("Could not load messages.");
      }
    }
    void hydrateMessages();
    return () => { cancelled = true; };
  }, [channel, isTeamChat, projectId]);

  useEffect(() => {
    if (!isTeamChat) return;
    let cancelled = false;
    let socket: RealtimeSocket | null = null;
    async function connect() {
      try {
        setLiveState("connecting");
        const ticketResponse = await fetch("/api/realtime/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId }) });
        const ticketData = await ticketResponse.json().catch(() => ({}));
        if (!ticketResponse.ok) throw new Error(ticketData.error ?? "Could not create a live chat ticket.");
        const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;
        if (!realtimeUrl) throw new Error("Live chat is not configured.");
        socket = io(realtimeUrl, { auth: { token: ticketData.token }, transports: ["websocket"] });
        socketRef.current = socket;
        socket.on("connect", () => {
          socket?.emit("workspace:join", projectId, (acknowledgement) => {
            if (acknowledgement.ok) { setLiveState("live"); setStatus("Live chat ready"); }
            else { setLiveState("error"); setStatus(acknowledgement.error ?? "Could not join live chat."); }
          });
        });
        socket.on("message:created", (message) => {
          if (message.projectId !== projectId || (message.channel ?? "discussion") !== "team") return;
          setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
        });
        socket.on("socket:error", (message) => { setLiveState("error"); setStatus(message); });
        socket.on("connect_error", () => { setLiveState("error"); setStatus("Live chat could not connect."); });
      } catch (error) {
        if (!cancelled) { setLiveState("error"); setStatus(error instanceof Error ? error.message : "Live chat could not connect."); }
      }
    }
    void connect();
    return () => { cancelled = true; socket?.disconnect(); socketRef.current = null; };
  }, [isTeamChat, projectId]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [messages]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setStatus(isTeamChat ? "Sending live message…" : "Sending…");
    const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, content: trimmed, channel }) });
    const data = await response.json();
    if (!response.ok) { setStatus(data.error ?? "Could not send message."); return; }
    const message = data.message as ChatMessage;
    if (isTeamChat && socketRef.current?.connected && liveState === "live") socketRef.current.emit("message:created", message);
    else setMessages((current) => [...current, message]);
    setContent("");
    setStatus(isTeamChat ? "Live chat ready" : "Synced");
  }

  const heading = isTeamChat ? "Team chat" : "Discussion board";
  const description = isTeamChat ? "Live Socket.IO chat. Messages are saved to the project database." : "Database-backed discussion. Refresh to load new posts.";
  const stateLabel = isTeamChat ? liveState === "live" ? "● Live" : liveState === "connecting" ? "Connecting…" : "Offline" : status;
  return <section className="flex h-[calc(100dvh-10rem)] min-h-[560px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/45 shadow-xl shadow-indigo-950/10 backdrop-blur md:h-[calc(100dvh-12rem)]"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5"><div><h2 className="text-lg font-semibold text-white">{heading}</h2><p className="mt-1 text-sm text-slate-400">{description}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => loadMessages().catch(() => setStatus("Could not load messages."))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10">Refresh</button><span className={`rounded-full border px-3 py-2 text-xs font-medium ${isTeamChat && liveState === "live" ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-white/5 text-slate-300"}`}>{stateLabel}</span></div></header><div ref={listRef} className="flex-1 space-y-5 overflow-y-auto p-6">{messages.length === 0 ? <div className="grid h-full place-items-center text-center"><div><p className="text-lg font-medium text-slate-200">Start the {isTeamChat ? "live team conversation" : "project discussion"}.</p><p className="mt-2 text-sm text-slate-500">{isTeamChat ? "Messages appear instantly for connected workspace members." : "Messages are stored in MongoDB and appear when members refresh."}</p></div></div> : messages.map((message) => { const isCurrentUser = message.senderId === currentUserId; const member = memberMap.get(message.senderId); return <div key={message.id} className={`max-w-[92%] rounded-2xl border px-5 py-4 text-base ${isCurrentUser ? "ml-auto border-violet-300/20 bg-gradient-to-br from-violet-200 to-fuchsia-200 text-slate-950" : "border-white/10 bg-white/[0.05] text-slate-100"}`}><div className={`mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${isCurrentUser ? "text-slate-800/75" : "text-slate-400"}`}><span className="font-semibold">{member?.name ?? "Team member"}</span><span>@{member?.username ?? "member"}</span><span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div><div className="whitespace-pre-wrap leading-7">{message.content}</div></div>; })}</div><form onSubmit={sendMessage} className="flex gap-3 border-t border-white/10 p-5"><input value={content} onChange={(event) => setContent(event.target.value)} maxLength={4000} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-5 py-4 text-base text-white outline-none transition focus:border-violet-400" placeholder={isTeamChat ? "Send a live message…" : "Add to the discussion…"} /><button className="rounded-xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50" disabled={!content.trim()}>Send</button></form></section>;
}
