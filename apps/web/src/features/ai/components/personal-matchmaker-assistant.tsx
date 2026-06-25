"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};
type Results = {
  developers: Array<{
    id: string;
    name: string;
    username: string;
    availability: string;
    roles: string[];
    skills: string[];
  }>;
  projects: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    status: string;
    requiredRoles: string[];
    requiredSkills: string[];
    memberCount: number;
    maxTeamSize: number;
  }>;
};

type PersonalMatchmakerAssistantProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelWidth: number;
  onPanelWidthChange: (width: number) => void;
};

function EmptySearchState({ type }: { type: "developers" | "projects" }) {
  return (
    <div className="rounded-2xl border border-dashed border-violet-300/20 bg-violet-300/[0.04] px-4 py-5 text-center">
      <p className="text-sm font-medium text-indigo-50">
        No matching {type} found yet.
      </p>
      <p className="mt-1 text-xs leading-5 text-indigo-100/45">
        Try another skill, role, or a broader search.
      </p>
    </div>
  );
}

export function PersonalMatchmakerAssistant({
  open,
  onOpenChange,
  panelWidth,
  onPanelWidthChange,
}: PersonalMatchmakerAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [results, setResults] = useState<Results | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Ready to search");
  const listRef = useRef<HTMLDivElement | null>(null);
  const stopResizingRef = useRef<(() => void) | null>(null);
  const isSearching = status === "Searching the matchmaker database…";

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function hydrate() {
      try {
        const response = await fetch("/api/matchmaker-assistant", {
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok)
          throw new Error(data.error ?? "Could not load assistant memory.");
        setMessages(data.messages ?? []);
        setStatus("Personal memory loaded");
      } catch (error) {
        if (!cancelled)
          setStatus(
            error instanceof Error
              ? error.message
              : "Could not load assistant memory.",
          );
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, results]);

  useEffect(() => () => stopResizingRef.current?.(), []);

  function startResize(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    stopResizingRef.current?.();

    const startX = event.clientX;
    const startWidth = panelWidth;
    const onPointerMove = (moveEvent: PointerEvent) => {
      onPanelWidthChange(
        Math.min(900, Math.max(320, startWidth + startX - moveEvent.clientX)),
      );
    };
    const stop = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stop);
      if (stopResizingRef.current === stop) stopResizingRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stop, { once: true });
    stopResizingRef.current = stop;
  }

  async function ask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = content.trim();
    if (!question) return;
    const optimistic: Message = {
      id: `pending-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);
    setResults(null);
    setContent("");
    setStatus("Searching the matchmaker database…");
    try {
      const searchStartedAt = Date.now();
      const response = await fetch("/api/matchmaker-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: question }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.error ?? "Assistant could not respond.");
      const remainingSearchTime = 1400 - (Date.now() - searchStartedAt);
      if (remainingSearchTime > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingSearchTime));
      }
      setMessages((current) => [
        ...current.filter((message) => message.id !== optimistic.id),
        data.userMessage,
        data.assistantMessage,
      ]);
      setResults(data.results);
      setStatus("Search complete");
    } catch (error) {
      setMessages((current) =>
        current.filter((message) => message.id !== optimistic.id),
      );
      setContent(question);
      setStatus(
        error instanceof Error ? error.message : "Assistant could not respond.",
      );
    }
  }

  const panel = open ? (
    <section
      role="dialog"
      aria-label="Matchmaker Assistant"
      className="fixed right-0 top-0 z-[100] flex h-[100dvh] max-w-full flex-col border-l border-white/15 bg-[#0d0637] shadow-2xl shadow-black/60 xl:sticky xl:top-0 xl:z-auto xl:-mr-10 xl:-mt-10 xl:h-[100dvh] xl:max-w-[40vw] xl:self-start"
      style={{ width: `${panelWidth}px` }}
    >
      <div
        onPointerDown={startResize}
        className="absolute left-0 top-0 h-full w-1 cursor-ew-resize touch-none bg-transparent transition hover:w-1.5 hover:bg-violet-300/70"
        aria-label="Resize assistant panel"
        role="separator"
        aria-orientation="vertical"
      />
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-lg border border-white/15 bg-[#0d0637]/90 px-2.5 py-2 text-xs font-semibold text-indigo-100/80 shadow-lg shadow-black/25 backdrop-blur transition hover:bg-white/10 hover:text-white"
        aria-label="Close Matchmaker Assistant"
      >
        {">>"}
      </button>
      <div ref={listRef} className="flex-1 space-y-5 overflow-y-auto p-6">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">
              Personal copilot
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Matchmaker Assistant
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="sticky top-4 z-10 rounded-lg border border-white/15 bg-[#0d0637]/90 px-3 py-2 text-sm font-semibold text-indigo-100/80 shadow-lg shadow-black/20 backdrop-blur transition hover:bg-white/10 hover:text-white"
            aria-label="Close Matchmaker Assistant"
          >
            {">>"}
          </button>
        </header>
        {messages.length === 0 && (
          <div className="rounded-3xl border border-violet-300/15 bg-violet-300/10 p-6">
            <p className="font-semibold text-white">
              What are you looking for?
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Find React developers who are available",
                "Show AI projects needing backend help",
                "Find a project for TypeScript and MongoDB",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setContent(suggestion)}
                  className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-2 text-left text-xs text-indigo-100 transition hover:bg-white/10"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => {
          const isAssistant = message.role === "assistant";

          return (
            <article
              key={message.id}
              className={`matchmaker-message-enter flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
            >
              {isAssistant && (
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-2xl border border-violet-200/20 bg-violet-200/15 text-sm text-violet-100">
                  ✦
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-3xl border px-4 py-3 shadow-lg ${isAssistant ? "rounded-tl-md border-violet-300/20 bg-gradient-to-br from-violet-300/15 to-indigo-300/[0.06] text-indigo-50 shadow-violet-950/20" : "rounded-tr-md border-sky-200/25 bg-sky-100 text-slate-950 shadow-black/20"}`}
              >
                <p
                  className={`mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ${isAssistant ? "text-violet-200" : "text-slate-600"}`}
                >
                  {isAssistant ? "Matchmaker" : "You"}
                </p>
                <p
                  className={`whitespace-pre-wrap text-sm leading-6 ${isAssistant ? "text-indigo-50" : "text-slate-950"}`}
                >
                  {message.content}
                </p>
              </div>
              {!isAssistant && (
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-sky-100 text-xs font-bold text-slate-950">
                  You
                </div>
              )}
            </article>
          );
        })}
        {isSearching && (
          <div className="matchmaker-searching max-w-[90%] rounded-2xl border border-violet-300/20 bg-violet-300/10 px-4 py-3 text-indigo-50" aria-live="polite">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-200/15 text-violet-100">✦</span>
              <div>
                <p className="text-sm font-medium">Matchmaker is searching</p>
                <p className="mt-0.5 text-xs text-indigo-100/55">Checking projects, skills, and available developers</p>
              </div>
              <span className="ml-auto flex gap-1" aria-hidden="true"><i className="matchmaker-thinking-dot" /><i className="matchmaker-thinking-dot" /><i className="matchmaker-thinking-dot" /></span>
            </div>
          </div>
        )}
        {results && (
          <div className="grid gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100/45">
                Developers found
              </p>
              <div className="grid gap-2">
                {results.developers.map((developer) => (
                  <Link
                    key={developer.id}
                    href={`/profile/${developer.username}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-white/25 hover:bg-white/[0.08]"
                  >
                    <p className="font-semibold text-white">
                      {developer.name}{" "}
                      <span className="text-sm font-normal text-indigo-100/55">
                        @{developer.username}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-indigo-100/55">
                      {developer.availability} ·{" "}
                      {developer.roles.join(" · ") || "Developer"}
                    </p>
                    <p className="mt-2 text-xs text-violet-100/70">
                      {developer.skills.slice(0, 5).join(" · ")}
                    </p>
                  </Link>
                ))}
                {!results.developers.length && (
                  <EmptySearchState type="developers" />
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100/45">
                Projects found
              </p>
              <div className="grid gap-2">
                {results.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-white/25 hover:bg-white/[0.08]"
                  >
                    <p className="font-semibold text-white">{project.title}</p>
                    <p className="mt-1 text-xs text-indigo-100/55">
                      {project.category} · {project.memberCount}/
                      {project.maxTeamSize} members
                    </p>
                    <p className="mt-2 text-xs text-violet-100/70">
                      {[...project.requiredSkills, ...project.requiredRoles]
                        .slice(0, 5)
                        .join(" · ")}
                    </p>
                  </Link>
                ))}
                {!results.projects.length && (
                  <EmptySearchState type="projects" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <form
        onSubmit={ask}
        className="border-t border-white/10 bg-indigo-950/35 p-4 shadow-[0_-20px_60px_rgba(15,10,60,0.35)] backdrop-blur"
      >
        <div className="group rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-2 transition focus-within:border-violet-200/45 focus-within:bg-slate-950/90 focus-within:shadow-[0_0_0_4px_rgba(196,181,253,0.08)]">
          <div className="flex items-end gap-2">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={2}
              maxLength={4000}
              className="min-h-14 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-indigo-100/35"
              placeholder="Find available React devs, AI projects, backend teammates..."
            />
            <button
              type="submit"
              disabled={
                !content.trim() ||
                status === "Searching the matchmaker database…"
              }
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-lg font-semibold text-indigo-950 shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              aria-label="Search with Matchmaker Assistant"
            >
              {isSearching ? "…" : "↗"}
            </button>
          </div>
          <div className="mt-1 flex items-center justify-between px-3 pb-1 text-[11px] text-indigo-100/35">
            <span>Private to your account</span>
            <span>{content.length}/4000</span>
          </div>
        </div>
      </form>
    </section>
  ) : null;
  return (
    <>
      {panel}
      {!open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="fixed right-5 top-5 z-40 grid h-12 w-12 place-items-center rounded-2xl border border-violet-200/30 bg-indigo-950 text-xl text-violet-100 shadow-xl shadow-indigo-950/40 transition hover:scale-105 hover:bg-violet-700 md:right-8 md:top-8"
          aria-label="Open Matchmaker Assistant"
        >
          ✦
        </button>
      )}
    </>
  );
}
