"use client";

import { useEffect, useRef, useState } from "react";

type AiMessage = { id: string; role: "user" | "assistant"; content: string; authorId?: string; createdAt: string };
type Member = { id: string; name: string; username: string };

export function ProjectAiAssist({ projectId, currentUserId, members }: { projectId: string; currentUserId: string; members: Member[] }) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Loading shared memory…");
  const listRef = useRef<HTMLDivElement | null>(null);
  const memberNames = new Map(members.map((member) => [member.id, member]));

  async function refresh() {
    setStatus("Refreshing memory…");
    const response = await fetch(`/api/ai-assist?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "Could not load AI Assist.");
    setMessages(data.messages);
    setStatus("Shared context ready");
  }

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const response = await fetch(`/api/ai-assist?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error ?? "Could not load AI Assist.");
        setMessages(data.messages);
        setStatus("Shared context ready");
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "Could not load AI Assist.");
      }
    }
    void hydrate();
    return () => { cancelled = true; };
  }, [projectId]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [messages]);

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = content.trim();
    if (!question) return;
    setStatus("AI is thinking…");
    setContent("");
    const optimistic: AiMessage = { id: `pending-${Date.now()}`, role: "user", content: question, authorId: currentUserId, createdAt: new Date().toISOString() };
    setMessages((current) => [...current, optimistic]);
    try {
      const response = await fetch("/api/ai-assist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, content: question }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "AI Assist could not respond.");
      setMessages((current) => [...current.filter((message) => message.id !== optimistic.id), data.userMessage, data.assistantMessage]);
      setStatus("Shared context updated");
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== optimistic.id));
      setContent(question);
      setStatus(error instanceof Error ? error.message : "AI Assist could not respond.");
    }
  }

  return <section className="flex h-[calc(100dvh-10rem)] min-h-[560px] flex-col overflow-hidden rounded-3xl border border-violet-300/15 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,.22),transparent_42%),rgba(15,8,55,.8)] shadow-xl shadow-indigo-950/20 backdrop-blur md:h-[calc(100dvh-12rem)]"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">Shared project copilot</p><h2 className="mt-1 text-xl font-semibold text-white">AI Assist</h2><p className="mt-1 text-sm text-indigo-100/55">Grounded in this project’s aim, recent team chat, and shared AI conversation.</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => void refresh().catch((error) => setStatus(error instanceof Error ? error.message : "Could not refresh AI Assist."))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-indigo-100 transition hover:bg-white/10">Refresh</button><span className="rounded-full border border-violet-300/15 bg-violet-300/10 px-3 py-2 text-xs font-medium text-violet-100">{status}</span></div></header><div ref={listRef} className="flex-1 space-y-5 overflow-y-auto p-6">{messages.length === 0 ? <div className="grid h-full place-items-center text-center"><div className="max-w-md"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-300/15 text-2xl text-violet-100">✦</span><h3 className="mt-5 text-lg font-semibold text-white">Ask about the project</h3><p className="mt-2 text-sm leading-6 text-indigo-100/60">Try “Break the project into milestones” or “What should we build first?” Every answer becomes shared context for the team.</p></div></div> : messages.map((message) => { const author = message.authorId ? memberNames.get(message.authorId) : undefined; const isAssistant = message.role === "assistant"; return <article key={message.id} className={`max-w-[92%] rounded-2xl border px-5 py-4 ${isAssistant ? "border-violet-300/20 bg-violet-300/10 text-indigo-50" : "ml-auto border-white/10 bg-white/[0.08] text-white"}`}><div className={`mb-2 flex items-center gap-2 text-xs ${isAssistant ? "text-violet-200" : "text-indigo-100/55"}`}><span className="font-semibold">{isAssistant ? "✦ AI Assist" : author?.name ?? "Team member"}</span>{!isAssistant && <span>@{author?.username ?? "member"}</span>}<span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div><p className="whitespace-pre-wrap leading-7">{message.content}</p></article>; })}</div><form onSubmit={send} className="border-t border-white/10 p-5"><div className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-2"><textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={4000} rows={2} className="min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-indigo-100/35" placeholder="Ask AI Assist about this project…" /><button disabled={!content.trim() || status === "AI is thinking…"} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50">Ask AI</button></div></form></section>;
}
