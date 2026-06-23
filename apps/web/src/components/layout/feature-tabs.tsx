"use client";

const features = [
  { id: "discover", label: "Discover" },
  { id: "projects", label: "Projects" },
  { id: "workspace", label: "Workspace" },
] as const;

export function FeatureTabs() {
  function scrollToFeature(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav aria-label="Landing page features" className="hidden items-center gap-1 lg:flex">
      <span className="mr-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200/55">Features</span>
      {features.map((feature) => (
        <button
          key={feature.id}
          type="button"
          onClick={() => scrollToFeature(feature.id)}
          className="rounded-md px-3 py-2 text-sm font-medium text-indigo-100/80 transition hover:bg-white/10 hover:text-white"
        >
          {feature.label}
        </button>
      ))}
    </nav>
  );
}
