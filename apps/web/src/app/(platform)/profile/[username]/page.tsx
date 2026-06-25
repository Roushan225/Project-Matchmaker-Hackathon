import { Avatar } from "@/components/shared/avatar";
import { TechPill } from "@/components/shared/tech-pill";
import { SendProjectInvite } from "@/features/projects/components/send-project-invite";
import { GitHubContributionGraph } from "@/features/profiles/components/github-contribution-graph";
import { listCompletedProjectsForUser } from "@/server/repositories/projects";
import { findProfileByUsername } from "@/server/repositories/users";

const availabilityLabels = {
  available: "Available",
  engaged: "Engaged",
  busy: "Busy",
  "looking-for-team": "Looking for team",
  "looking-for-projects": "Looking for projects",
} as const;

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const fallbackName = username
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
  let profile = null;
  try {
    profile = await findProfileByUsername(username);
  } catch {
    /* Demo profile fallback. */
  }

  const displayName = profile?.name ?? fallbackName;
  const skills = profile?.techStack.length
    ? profile.techStack
    : ["TypeScript", "Next.js", "MongoDB", "Product thinking"];
  const status = profile
    ? availabilityLabels[profile.availability]
    : "Available";
  const github = profile?.github;
  const githubProfileUrl = profile?.githubProfileUrl ?? "https://github.com";
  const completedProjects = profile
    ? await listCompletedProjectsForUser(profile.id)
    : [];
  const projectInterests = profile?.projectInterests ?? [
    "Open source",
    "Hackathons",
    "Product work",
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(120deg,rgba(30,22,88,.86),rgba(16,11,61,.74))] p-6 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl md:p-8">
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-5">
            <Avatar name={displayName} image={profile?.image} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-indigo-200">● {status}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  {displayName}
                </h1>
                {profile?.username && (
                  <span className="text-sm text-indigo-100/50">
                    @{profile.username}
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-indigo-100/65">
                {profile?.headline || "Developer profile synced from GitHub"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={githubProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/20 bg-white/[0.07] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-indigo-950"
            >
              Open GitHub ↗
            </a>
            {profile && (
              <SendProjectInvite
                recipientId={profile.id}
                recipientName={displayName}
              />
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric label="Completed projects" value={completedProjects.length} />
        <Metric label="Public repos" value={github?.publicRepos ?? "—"} />
        <Metric label="Followers" value={github?.followers ?? "—"} />
        <Metric label="Following" value={github?.following ?? "—"} />
        <Metric
          label="Organizations"
          value={github?.organizations.length ?? "—"}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_1.95fr]">
        <div className="rounded-2xl border border-white/12 bg-white/[0.07] p-6 shadow-xl shadow-indigo-950/15 backdrop-blur">
          <p className="text-sm font-semibold text-white">About</p>
          <p className="mt-3 leading-7 text-indigo-100/70">
            {profile?.bio ||
              "This developer completed a Matchmaker profile with their skills, availability, and project interests."}
          </p>
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-100/50">
              Project interests
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {projectInterests.map((interest) => (
                <TechPill key={interest} label={interest} subtle />
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/12 bg-white/[0.07] p-6 shadow-xl shadow-indigo-950/15 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">
              Technical profile
            </p>
            {github?.syncedAt && (
              <p className="text-xs text-indigo-100/45">
                GitHub synced {github.syncedAt.toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-100/50">
                Skills
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <TechPill key={skill} label={skill} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-100/50">
                Repository languages
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {github?.languages.length ? (
                  github.languages.map((language) => (
                    <TechPill key={language} label={language} subtle />
                  ))
                ) : (
                  <p className="text-sm text-indigo-100/45">
                    Sync GitHub to load language data.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/12 bg-white/[0.07] p-6 shadow-xl shadow-indigo-950/15 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-white">
              Contribution activity
            </p>
            <p className="mt-1 text-sm text-indigo-100/55">
              GitHub commit and contribution activity from the last 12 months.
            </p>
          </div>
          {github?.syncedAt && (
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-indigo-100/60">
              Synced {github.syncedAt.toLocaleDateString()}
            </span>
          )}
        </div>
        <GitHubContributionGraph
          totalContributions={
            github?.contributionCalendar?.totalContributions ?? 0
          }
          days={github?.contributionCalendar?.days ?? []}
        />
      </section>

      <section className="rounded-2xl border border-white/12 bg-white/[0.07] shadow-xl shadow-indigo-950/15 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-lg font-semibold text-white">
              Completed Matchmaker projects
            </p>
            <p className="mt-1 text-sm text-indigo-100/55">
              Projects this member completed with accepted teams.
            </p>
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
            {completedProjects.length} completed
          </span>
        </div>
        {completedProjects.length ? (
          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {completedProjects.map((project) => (
              <a
                key={project.id}
                href={`/projects/${project.slug}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-emerald-200/30 hover:bg-white/[0.08]"
              >
                <p className="font-semibold text-white">{project.title}</p>
                <p className="mt-1 text-xs text-emerald-100/70">
                  Completed · {project.memberIds.length}/{project.maxTeamSize}{" "}
                  members
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-indigo-100/55">
                  {project.description}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p className="px-6 py-10 text-center text-sm text-indigo-100/50">
            Completed projects will appear here when a project owner marks a
            shared project completed.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-white/12 bg-white/[0.07] shadow-xl shadow-indigo-950/15 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-lg font-semibold text-white">
              GitHub repositories
            </p>
            <p className="mt-1 text-sm text-indigo-100/55">
              Public repositories with current activity and commit progress.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-indigo-100/70">
            {github?.repositories.length ?? 0} synced
          </span>
        </div>
        {github?.repositories.length ? (
          <div className="divide-y divide-white/10">
            {github.repositories.map((repository) => (
              <a
                key={repository.id}
                href={repository.url}
                target="_blank"
                rel="noreferrer"
                className="group grid gap-4 px-6 py-5 transition hover:bg-white/[0.06] md:grid-cols-[minmax(0,1.4fr)_minmax(240px,1fr)_auto] md:items-center"
              >
                <div className="min-w-0">
                  <p className="font-medium text-white group-hover:text-indigo-100">
                    {repository.name}
                  </p>
                  <p className="mt-1 truncate text-sm text-indigo-100/55">
                    {repository.description || "No repository description."}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-300 to-fuchsia-300"
                        style={{
                          width: `${Math.min(100, (repository.recentCommitCount ?? 0) * 10)}%`,
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap text-xs text-indigo-100/55">
                      {repository.recentCommitCount ?? 0} commits · 30d
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {repository.primaryLanguage && (
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-indigo-100/75">
                      {repository.primaryLanguage}
                    </span>
                  )}
                  {repository.topics.slice(0, 2).map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-indigo-100/60"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-indigo-100/60">
                  <span>★ {repository.stars}</span>
                  <span>⑂ {repository.forks}</span>
                  <span className="text-white/70">Open ↗</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-indigo-100/55">
            No GitHub repository data has been synced yet.
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.07] px-5 py-4 shadow-lg shadow-indigo-950/10 backdrop-blur">
      <p className="text-xs font-medium text-indigo-100/55">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
