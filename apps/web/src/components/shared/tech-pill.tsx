type TechPillProps = { label: string; subtle?: boolean };

export function TechPill({ label, subtle = false }: TechPillProps) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${subtle ? "border-slate-700 bg-slate-800/70 text-slate-300" : "border-teal-400/20 bg-teal-400/10 text-teal-200"}`}>
      {label}
    </span>
  );
}
