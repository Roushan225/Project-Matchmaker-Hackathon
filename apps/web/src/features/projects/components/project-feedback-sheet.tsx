"use client";

import { useEffect, useState } from "react";

type Feedback = {
  id: string;
  rating: number;
  thoughts: string;
  highlights?: string;
  improvements?: string;
};

export function ProjectFeedbackSheet({
  projectId,
  projectTitle,
  memberCount,
}: {
  projectId: string;
  projectTitle: string;
  memberCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [thoughts, setThoughts] = useState("");
  const [highlights, setHighlights] = useState("");
  const [improvements, setImprovements] = useState("");
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("Loading feedback sheet…");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const response = await fetch(
          `/api/project-feedback?projectId=${encodeURIComponent(projectId)}`,
          { cache: "no-store" },
        );
        const data = (await response.json().catch(() => ({}))) as {
          feedback?: Feedback;
          feedbackCount?: number;
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error ?? "Could not load feedback.");
        setFeedbackCount(data.feedbackCount ?? 0);
        if (data.feedback) {
          setRating(data.feedback.rating);
          setThoughts(data.feedback.thoughts);
          setHighlights(data.feedback.highlights ?? "");
          setImprovements(data.feedback.improvements ?? "");
          setSubmitted(true);
          setStatus("Your feedback is saved.");
        } else {
          setOpen(true);
          setStatus("Feedback requested.");
        }
      } catch (error) {
        if (!cancelled)
          setStatus(error instanceof Error ? error.message : "Could not load feedback.");
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("Saving feedback…");
    try {
      const response = await fetch("/api/project-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          rating,
          thoughts,
          highlights,
          improvements,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Could not save feedback.");
      setSubmitted(true);
      setOpen(false);
      setFeedbackCount((current) => Math.max(current, 1));
      setStatus("Thanks. Your feedback is saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save feedback.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="mb-4 rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5 shadow-xl shadow-emerald-950/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-100/80">
              Project completed
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Final feedback is open
            </h2>
            <p className="mt-1 text-sm text-emerald-50/65">
              {feedbackCount}/{memberCount} member
              {memberCount === 1 ? "" : "s"} shared thoughts for {projectTitle}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-100"
          >
            {submitted ? "Edit feedback" : "Share feedback"}
          </button>
        </div>
        <p className="mt-3 text-xs text-emerald-50/55">{status}</p>
      </section>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          className="fixed inset-0 z-[120] flex min-h-dvh w-screen items-center justify-center overflow-y-auto bg-[#07031d]/90 p-4 backdrop-blur-md md:p-8"
        >
          <form
            onSubmit={submit}
            className="w-full max-w-2xl rounded-[2rem] border border-white/15 bg-[#130a48] p-6 shadow-2xl shadow-black/60 md:p-8"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
                  Final feedback
                </p>
                <h2 id="feedback-title" className="mt-2 text-3xl font-semibold text-white">
                  Share thoughts on {projectTitle}
                </h2>
                <p className="mt-2 leading-7 text-indigo-100/65">
                  Capture what worked, what could improve, and how the team can
                  use this learning on the next project.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm text-indigo-100/70 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>

            <label className="mt-7 grid gap-2 text-sm font-medium text-indigo-100">
              Rating
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="rounded-xl border border-white/15 bg-[#1c1458] px-4 py-3 text-white outline-none focus:border-violet-300"
              >
                <option value={5}>5 · Excellent collaboration</option>
                <option value={4}>4 · Strong project</option>
                <option value={3}>3 · Good with gaps</option>
                <option value={2}>2 · Difficult project</option>
                <option value={1}>1 · Needs major improvement</option>
              </select>
            </label>

            <label className="mt-5 grid gap-2 text-sm font-medium text-indigo-100">
              Overall thoughts
              <textarea
                required
                value={thoughts}
                onChange={(event) => setThoughts(event.target.value)}
                rows={5}
                maxLength={1200}
                placeholder="What did you learn? How did the team collaborate?"
                className="resize-none rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/35 focus:border-violet-300"
              />
            </label>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-indigo-100">
                Highlights
                <textarea
                  value={highlights}
                  onChange={(event) => setHighlights(event.target.value)}
                  rows={4}
                  maxLength={800}
                  placeholder="Wins, good decisions, strong teamwork..."
                  className="resize-none rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/35 focus:border-violet-300"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-indigo-100">
                Improvements
                <textarea
                  value={improvements}
                  onChange={(event) => setImprovements(event.target.value)}
                  rows={4}
                  maxLength={800}
                  placeholder="What should change next time?"
                  className="resize-none rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-white outline-none transition placeholder:text-indigo-100/35 focus:border-violet-300"
                />
              </label>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-indigo-100/55">{status}</p>
              <button
                disabled={saving || thoughts.trim().length < 10}
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save feedback"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
