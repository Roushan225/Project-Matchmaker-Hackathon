import type { GitHubContributionDay } from "@project-matchmaker/shared";

export function GitHubContributionGraph({ totalContributions, days }: { totalContributions: number; days: GitHubContributionDay[] }) {
  if (!days.length) return <p className="mt-4 text-sm text-indigo-100/50">Sync GitHub to load contribution activity.</p>;

  return <div className="mt-5 overflow-x-auto pb-2">
    <div className="min-w-[680px]">
      <div className="mb-3 flex items-center justify-between gap-4"><p className="text-sm text-indigo-100/70"><span className="font-semibold text-white">{totalContributions.toLocaleString()}</span> contributions in the last year</p><div className="flex items-center gap-1.5 text-xs text-indigo-100/50"><span>Less</span>{["#13261c", "#0e4429", "#006d32", "#26a641", "#39d353"].map((color) => <span key={color} className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />)}<span>More</span></div></div>
      <div className="grid grid-flow-col gap-1" style={{ gridTemplateRows: "repeat(7, 11px)", gridAutoColumns: "11px" }}>{days.map((day) => <span key={day.date} title={`${day.date}: ${day.count} contributions`} className="rounded-[2px] ring-1 ring-white/5" style={{ backgroundColor: day.count ? day.color : "rgba(255,255,255,0.06)" }} />)}</div>
    </div>
  </div>;
}
