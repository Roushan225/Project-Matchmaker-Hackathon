"use client";

import { useState } from "react";

type OnboardingFormProps = {
  initialProfile: {
    headline?: string;
    techStack: string[];
    roles: string[];
    projectInterests: string[];
    weeklyAvailability: "1-3" | "4-7" | "8-12" | "12+";
    availability: "available" | "busy" | "looking-for-team" | "looking-for-projects";
    discoverable: boolean;
  };
};

const splitList = (value: FormDataEntryValue | null) => String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);

export function OnboardingForm({ initialProfile }: OnboardingFormProps) {
  const [message, setMessage] = useState<string>();
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true);
    setMessage(undefined);
    const response = await fetch("/api/profile/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        headline: formData.get("headline"),
        techStack: splitList(formData.get("techStack")),
        roles: splitList(formData.get("roles")),
        projectInterests: splitList(formData.get("projectInterests")),
        weeklyAvailability: formData.get("weeklyAvailability"),
        availability: formData.get("availability"),
        discoverable: formData.get("discoverable") === "on",
      }),
    });
    const data = await response.json();
    if (response.ok) window.location.assign("/dashboard");
    else {
      setMessage(data.error ?? "Could not save your profile.");
      setSaving(false);
    }
  }

  return (
    <form action={submit} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-medium text-indigo-100">Your builder headline <span className="font-normal text-indigo-200/55">Optional</span><input name="headline" defaultValue={initialProfile.headline} maxLength={100} className="rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-white outline-none placeholder:text-indigo-200/45 focus:border-violet-300" placeholder="e.g. Full-stack developer who enjoys climate tech" /></label>
      <label className="grid gap-2 text-sm font-medium text-indigo-100">Technical skills <span className="font-normal text-violet-200">Required · comma separated</span><input required name="techStack" defaultValue={initialProfile.techStack.join(", ")} className="rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-white outline-none placeholder:text-indigo-200/45 focus:border-violet-300" placeholder="TypeScript, Next.js, MongoDB" /></label>
      <label className="grid gap-2 text-sm font-medium text-indigo-100">Roles you want to take <span className="font-normal text-violet-200">Required · comma separated</span><input required name="roles" defaultValue={initialProfile.roles.join(", ")} className="rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-white outline-none placeholder:text-indigo-200/45 focus:border-violet-300" placeholder="Frontend engineer, Product designer" /></label>
      <label className="grid gap-2 text-sm font-medium text-indigo-100">Project interests <span className="font-normal text-violet-200">Required · comma separated</span><input required name="projectInterests" defaultValue={initialProfile.projectInterests.join(", ")} className="rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-white outline-none placeholder:text-indigo-200/45 focus:border-violet-300" placeholder="Open source, AI, Education" /></label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium text-indigo-100">Time each week<select name="weeklyAvailability" defaultValue={initialProfile.weeklyAvailability} className="rounded-lg border border-white/15 bg-[#1c1458] px-3 py-2.5 text-white outline-none focus:border-violet-300"><option value="1-3">1–3 hours</option><option value="4-7">4–7 hours</option><option value="8-12">8–12 hours</option><option value="12+">12+ hours</option></select></label><label className="grid gap-2 text-sm font-medium text-indigo-100">Current status<select name="availability" defaultValue={initialProfile.availability} className="rounded-lg border border-white/15 bg-[#1c1458] px-3 py-2.5 text-white outline-none focus:border-violet-300"><option value="available">Available</option><option value="looking-for-team">Looking for a team</option><option value="looking-for-projects">Looking for projects</option><option value="busy">Busy</option></select></label></div>
      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-indigo-100"><input name="discoverable" defaultChecked={initialProfile.discoverable} type="checkbox" className="mt-0.5 h-4 w-4 accent-violet-300" /><span><b className="block text-white">Let project owners discover me</b><span className="mt-1 block text-indigo-200/65">Your skills, roles, availability, and GitHub-backed profile can appear in search.</span></span></label>
      {message && <p className="rounded-lg bg-rose-400/10 px-3 py-2 text-sm text-rose-100">{message}</p>}
      <button disabled={saving} className="mt-1 rounded-lg bg-white px-5 py-3 font-semibold text-indigo-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-70">{saving ? "Saving profile…" : "Complete profile"}</button>
    </form>
  );
}
