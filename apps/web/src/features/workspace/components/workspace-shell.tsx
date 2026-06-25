"use client";

import { useEffect, useRef, useState } from "react";
import { WorkspaceChat } from "@/features/chat/components/workspace-chat";
import { WorkspaceResourceBoard } from "@/features/resources/components/workspace-resource-board";
import { WorkspaceExpenseTracker } from "@/features/expenses/components/workspace-expense-tracker";
import { ProjectAiAssist } from "@/features/ai/components/project-ai-assist";
import { ProjectFeedbackSheet } from "@/features/projects/components/project-feedback-sheet";

type WorkspaceMember = { id: string; name: string; username: string };
type WorkspaceTab = "chat" | "discussion" | "resources" | "expenses" | "ai";

const tabs: Array<{
  id: WorkspaceTab;
  label: string;
  detail: string;
  icon: string;
}> = [
  { id: "chat", label: "Team chat", detail: "Messages", icon: "#" },
  {
    id: "discussion",
    label: "Discussion board",
    detail: "Team chat for now",
    icon: "◌",
  },
  {
    id: "resources",
    label: "Resource board",
    detail: "Files & references",
    icon: "↑",
  },
  {
    id: "expenses",
    label: "Expense tracker",
    detail: "Project costs",
    icon: "$",
  },
  { id: "ai", label: "AI Assist", detail: "Shared copilot", icon: "✦" },
];

function WorkspaceTabSkeleton({ activeTab }: { activeTab: WorkspaceTab }) {
  const isAi = activeTab === "ai";

  return (
    <div className="matchmaker-message-enter">
      {!isAi && (
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="grid gap-2">
            <div className="h-4 w-24 animate-pulse rounded-full bg-violet-200/20" />
            <div className="h-8 w-56 animate-pulse rounded-xl bg-white/10" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
        </div>
      )}
      <section
        className={`overflow-hidden rounded-3xl border border-white/10 bg-slate-950/45 shadow-xl shadow-indigo-950/10 backdrop-blur ${isAi ? "h-[calc(100dvh-5rem)] min-h-[640px]" : "h-[calc(100dvh-10rem)] min-h-[560px] md:h-[calc(100dvh-12rem)]"}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="grid gap-2">
            <div className="h-4 w-32 animate-pulse rounded-full bg-violet-200/20" />
            <div className="h-6 w-44 animate-pulse rounded-xl bg-white/10" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 animate-pulse rounded-lg bg-white/10" />
            <div className="h-9 w-28 animate-pulse rounded-full bg-violet-200/10" />
          </div>
        </div>
        <div className="space-y-5 p-6">
          <div className="max-w-[72%] rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-3 h-3 w-28 animate-pulse rounded-full bg-white/15" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
              <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/10" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
          <div className="ml-auto max-w-[68%] rounded-2xl border border-violet-200/15 bg-violet-200/10 p-5">
            <div className="mb-3 h-3 w-24 animate-pulse rounded-full bg-violet-100/25" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded-full bg-violet-100/20" />
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-violet-100/20" />
            </div>
          </div>
          <div className="max-w-[76%] rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-3 h-3 w-32 animate-pulse rounded-full bg-white/15" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
              <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function WorkspaceShell({
  projectId,
  projectTitle,
  projectStatus,
  currentUserId,
  members,
}: {
  projectId: string;
  projectTitle: string;
  projectStatus: string;
  currentUserId: string;
  members: WorkspaceMember[];
}) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");
  const [showTabSkeleton, setShowTabSkeleton] = useState(false);
  const skeletonTimerRef = useRef<number | null>(null);
  const active = tabs.find((tab) => tab.id === activeTab)!;

  useEffect(() => {
    return () => {
      if (skeletonTimerRef.current)
        window.clearTimeout(skeletonTimerRef.current);
    };
  }, []);

  function changeTab(nextTab: WorkspaceTab) {
    if (nextTab === activeTab) return;
    if (skeletonTimerRef.current) window.clearTimeout(skeletonTimerRef.current);
    setActiveTab(nextTab);
    setShowTabSkeleton(true);
    skeletonTimerRef.current = window.setTimeout(() => {
      setShowTabSkeleton(false);
      skeletonTimerRef.current = null;
    }, 650);
  }

  return (
    <div className="grid min-h-[calc(100dvh-5rem)] gap-5 xl:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-white/10 bg-[#10083e]/75 p-3 shadow-xl shadow-indigo-950/20 backdrop-blur">
        <div className="border-b border-white/10 px-3 pb-4 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/45">
            {projectStatus}
          </p>
          <p className="mt-1 truncate font-semibold text-white">
            {projectTitle}
          </p>
          <p className="mt-1 text-xs text-indigo-100/55">
            Workspace navigation
          </p>
        </div>
        <nav aria-label="Workspace sections" className="mt-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => changeTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${activeTab === tab.id ? "bg-white text-indigo-950 shadow-lg shadow-indigo-950/20" : "text-indigo-100/70 hover:bg-white/10 hover:text-white"}`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-bold ${activeTab === tab.id ? "bg-indigo-950/10" : "bg-white/10"}`}
              >
                {tab.icon}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {tab.label}
                </span>
                <span
                  className={`block truncate text-xs ${activeTab === tab.id ? "text-indigo-950/60" : "text-indigo-100/45"}`}
                >
                  {tab.detail}
                </span>
              </span>
            </button>
          ))}
        </nav>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-indigo-100/60">
          <span className="font-semibold text-white">{members.length}</span>{" "}
          accepted member{members.length === 1 ? "" : "s"} can collaborate here.
        </div>
      </aside>
      <div className="min-w-0">
        {projectStatus === "completed" && (
          <ProjectFeedbackSheet
            projectId={projectId}
            projectTitle={projectTitle}
            memberCount={members.length}
          />
        )}
        {showTabSkeleton ? (
          <WorkspaceTabSkeleton activeTab={activeTab} />
        ) : (
          <>
            {activeTab !== "ai" && (
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-violet-200">
                    {active.label}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">
                    {projectTitle}
                  </h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold capitalize text-indigo-100/70">
                  {projectStatus}
                </span>
              </div>
            )}
            {activeTab === "chat" && (
              <WorkspaceChat
                projectId={projectId}
                currentUserId={currentUserId}
                members={members}
                channel="team"
              />
            )}
            {activeTab === "discussion" && (
              <WorkspaceChat
                projectId={projectId}
                currentUserId={currentUserId}
                members={members}
                channel="discussion"
              />
            )}
            {activeTab === "resources" && (
              <WorkspaceResourceBoard projectId={projectId} members={members} />
            )}
            {activeTab === "expenses" && (
              <WorkspaceExpenseTracker
                projectId={projectId}
                members={members}
              />
            )}
            {activeTab === "ai" && (
              <ProjectAiAssist
                projectId={projectId}
                currentUserId={currentUserId}
                members={members}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
