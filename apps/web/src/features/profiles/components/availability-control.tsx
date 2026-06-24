"use client";

import { useState } from "react";
import type { AvailabilityStatus } from "@project-matchmaker/shared";

const labels: Record<AvailabilityStatus, string> = { available: "Available", engaged: "Engaged", busy: "Busy", "looking-for-team": "Looking for a team", "looking-for-projects": "Looking for projects" };

export function AvailabilityControl({ initialAvailability }: { initialAvailability: AvailabilityStatus }) {
  const [availability, setAvailability] = useState(initialAvailability);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function change(nextAvailability: AvailabilityStatus) {
    const previousAvailability = availability;
    setAvailability(nextAvailability);
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/profile/availability", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ availability: nextAvailability }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setAvailability(previousAvailability); setMessage(data.error ?? "Could not update availability."); }
    else setMessage("Availability updated.");
    setSaving(false);
  }
  return <div className="mt-4"><label className="grid gap-2 text-sm text-indigo-100/65">Your availability<select value={availability} disabled={saving} onChange={(event) => void change(event.target.value as AvailabilityStatus)} className="rounded-lg border border-white/15 bg-[#120a44] px-3 py-2.5 font-semibold text-white outline-none disabled:opacity-60"><option value="available">Available</option><option value="engaged">Engaged</option><option value="looking-for-team">Looking for a team</option><option value="looking-for-projects">Looking for projects</option><option value="busy">Busy</option></select></label>{message && <p className="mt-2 text-xs text-indigo-100/60">{message}</p>}<p className="mt-2 text-xs text-indigo-100/45">Current: {labels[availability]}</p></div>;
}
