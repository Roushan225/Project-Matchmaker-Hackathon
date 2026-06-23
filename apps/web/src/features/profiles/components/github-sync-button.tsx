"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GitHubSyncButton() {
  const [state, setState] = useState<"idle" | "syncing" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function sync() {
    setState("syncing");
    const response = await fetch("/api/github/sync", { method: "POST" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setErrorMessage(data.error ?? "Could not sync GitHub data.");
      setState("error");
      return;
    }
    setState("idle");
    router.refresh();
  }

  return <div><button type="button" onClick={sync} disabled={state === "syncing"} className="rounded-lg border border-white/20 bg-white/[0.07] px-3 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-white hover:text-indigo-950 disabled:cursor-wait disabled:opacity-70">{state === "syncing" ? "Syncing GitHub…" : "Refresh GitHub data"}</button>{state === "error" && <p className="mt-2 text-xs text-rose-200">{errorMessage}</p>}</div>;
}
