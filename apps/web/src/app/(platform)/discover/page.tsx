import { DeveloperDirectory, type DirectoryPerson } from "@/features/discovery/components/developer-directory";
import { listDiscoverableProfiles } from "@/server/repositories/users";

const availabilityLabels = {
  available: "Available",
  engaged: "Engaged",
  busy: "Busy",
  "looking-for-team": "Looking for team",
  "looking-for-projects": "Looking for projects",
} as const;

export default async function DiscoverPage() {
  let realPeople: DirectoryPerson[] = [];
  try {
    const profiles = await listDiscoverableProfiles();
    realPeople = profiles.map((profile) => ({ name: profile.name, username: profile.username, image: profile.image, role: profile.roles.join(" · ") || "Developer", availability: availabilityLabels[profile.availability], stack: profile.techStack }));
  } catch {
    // Keep demo profiles available if the database is temporarily unavailable.
  }
  return <div className="mx-auto max-w-6xl"><p className="text-sm font-medium text-indigo-200">Developer discovery</p><h1 className="mt-2 text-3xl font-semibold text-white">Find the missing skill on your team.</h1><DeveloperDirectory realPeople={realPeople} /></div>;
}
