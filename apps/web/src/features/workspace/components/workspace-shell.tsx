"use client";

import { useState } from "react";
import { WorkspaceChat } from "@/features/chat/components/workspace-chat";
import { WorkspaceResourceBoard } from "@/features/resources/components/workspace-resource-board";
import { WorkspaceExpenseTracker } from "@/features/expenses/components/workspace-expense-tracker";
import { ProjectAiAssist } from "@/features/ai/components/project-ai-assist";

type WorkspaceMember = { id: string; name: string; username: string };
type WorkspaceTab = "chat" | "discussion" | "resources" | "expenses" | "ai";

const tabs: Array<{ id: WorkspaceTab; label: string; detail: string; icon: string }> = [
  { id: "chat", label: "Team chat", detail: "Messages", icon: "#" },
  { id: "discussion", label: "Discussion board", detail: "Team chat for now", icon: "◌" },
  { id: "resources", label: "Resource board", detail: "Files & references", icon: "↑" },
  { id: "expenses", label: "Expense tracker", detail: "Project costs", icon: "$" },
  { id: "ai", label: "AI Assist", detail: "Shared copilot", icon: "✦" },
];

export function WorkspaceShell({ projectId, projectTitle, projectStatus, currentUserId, members }: { projectId: string; projectTitle: string; projectStatus: string; currentUserId: string; members: WorkspaceMember[] }) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");
  const active = tabs.find((tab) => tab.id === activeTab)!;
  return <div className="grid min-h-[calc(100dvh-5rem)] gap-5 xl:grid-cols-[230px_minmax(0,1fr)]"><aside className="rounded-3xl border border-white/10 bg-[#10083e]/75 p-3 shadow-xl shadow-indigo-950/20 backdrop-blur"><div className="border-b border-white/10 px-3 pb-4 pt-2"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/45">{projectStatus}</p><p className="mt-1 truncate font-semibold text-white">{projectTitle}</p><p className="mt-1 text-xs text-indigo-100/55">Workspace navigation</p></div><nav aria-label="Workspace sections" className="mt-3 space-y-1">{tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${activeTab === tab.id ? "bg-white text-indigo-950 shadow-lg shadow-indigo-950/20" : "text-indigo-100/70 hover:bg-white/10 hover:text-white"}`}><span className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-bold ${activeTab === tab.id ? "bg-indigo-950/10" : "bg-white/10"}`}>{tab.icon}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{tab.label}</span><span className={`block truncate text-xs ${activeTab === tab.id ? "text-indigo-950/60" : "text-indigo-100/45"}`}>{tab.detail}</span></span></button>)}</nav><div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-indigo-100/60"><span className="font-semibold text-white">{members.length}</span> accepted member{members.length === 1 ? "" : "s"} can collaborate here.</div></aside>
    <div className="min-w-0">{activeTab !== "ai" && <div className="mb-3 flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-violet-200">{active.label}</p><h2 className="mt-1 text-2xl font-semibold text-white">{projectTitle}</h2></div><span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold capitalize text-indigo-100/70">{projectStatus}</span></div>}{activeTab === "chat" && <WorkspaceChat projectId={projectId} currentUserId={currentUserId} members={members} channel="team" />}{activeTab === "discussion" && <WorkspaceChat projectId={projectId} currentUserId={currentUserId} members={members} channel="discussion" />}{activeTab === "resources" && <WorkspaceResourceBoard projectId={projectId} members={members} />}{activeTab === "expenses" && <WorkspaceExpenseTracker projectId={projectId} members={members} />}{activeTab === "ai" && <ProjectAiAssist projectId={projectId} currentUserId={currentUserId} members={members} />}</div>
  </div>;
}
