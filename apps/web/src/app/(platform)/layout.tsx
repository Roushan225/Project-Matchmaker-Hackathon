import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/server/require-user";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AppShell userName={user.name ?? "Developer"}>{children}</AppShell>;
}
