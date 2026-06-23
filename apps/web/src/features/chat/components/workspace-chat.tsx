"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage, ClientToServerEvents, ServerToClientEvents } from "@project-matchmaker/shared";

type MatchmakerSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function WorkspaceChat({ projectId, currentUserId }: { projectId: string; currentUserId: string }) {
  const socketRef = useRef<MatchmakerSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Connecting chat…");

  useEffect(() => {
    let active = true;
    async function connect() {
      const response = await fetch("/api/realtime/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId }) });
      const data = await response.json();
      if (!response.ok) { if (active) setStatus(data.error ?? "Chat is unavailable."); return; }
      const socket: MatchmakerSocket = io(process.env.NEXT_PUBLIC_REALTIME_URL ?? "http://localhost:4000", { auth: { token: data.token } });
      socketRef.current = socket;
      socket.on("connect", () => socket.emit("workspace:join", projectId, (result) => setStatus(result.ok ? "Live" : (result.error ?? "Could not join chat."))));
      socket.on("message:created", (message) => setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]));
      socket.on("socket:error", (message) => setStatus(message));
    }
    connect().catch(() => active && setStatus("Could not connect to chat."));
    return () => { active = false; socketRef.current?.disconnect(); socketRef.current = null; };
  }, [projectId]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setStatus("Sending…");
    const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, content: trimmed }) });
    const data = await response.json();
    if (!response.ok) { setStatus(data.error ?? "Could not send message."); return; }
    socketRef.current?.emit("message:created", data.message);
    setContent("");
    setStatus("Live");
  }

  return <section className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"><header className="flex items-center justify-between border-b border-slate-800 px-5 py-4"><div><h2 className="font-semibold text-white">Team chat</h2><p className="mt-0.5 text-xs text-slate-400">One focused room for this project</p></div><span className="rounded-full bg-teal-400/10 px-2.5 py-1 text-xs font-medium text-teal-200">{status}</span></header><div className="flex-1 space-y-3 overflow-y-auto p-5">{messages.length === 0 ? <div className="grid h-full place-items-center text-center"><div><p className="font-medium text-slate-200">Start the project conversation.</p><p className="mt-1 text-sm text-slate-500">Messages are available only to accepted workspace members.</p></div></div> : messages.map((message) => <div key={message.id} className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${message.senderId === currentUserId ? "ml-auto bg-teal-400 text-slate-950" : "bg-slate-800 text-slate-100"}`}>{message.content}</div>)}</div><form onSubmit={sendMessage} className="flex gap-3 border-t border-slate-800 p-4"><input value={content} onChange={(event) => setContent(event.target.value)} maxLength={4000} className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-400" placeholder="Write a message…" /><button className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50" disabled={!content.trim()}>Send</button></form></section>;
}
