type TechPillProps = { label: string; subtle?: boolean };

export function TechPill({ label, subtle = false }: TechPillProps) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${subtle ? "border-white/10 bg-white/[0.07] text-indigo-100/75" : "border-white/15 bg-white/[0.1] text-indigo-100"}`}>
      {label}
    </span>
  );
}
