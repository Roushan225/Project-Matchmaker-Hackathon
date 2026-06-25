"use client";

import { useState } from "react";
import { PersonalMatchmakerAssistant } from "./personal-matchmaker-assistant";
import { SmartNotifications } from "@/features/notifications/components/smart-notifications";

export function DashboardCopilotLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(380);

  return <div className={open ? "dashboard-copilot-open grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_auto]" : "min-w-0"}>
    <div className="min-w-0">{children}</div>
    <SmartNotifications copilotOpen={open} copilotWidth={panelWidth} />
    <PersonalMatchmakerAssistant open={open} onOpenChange={setOpen} panelWidth={panelWidth} onPanelWidthChange={setPanelWidth} />
  </div>;
}
