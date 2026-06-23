import { AppShell } from "@/components/layout/app-shell";
import { requireCompletedUser } from "@/server/require-user";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCompletedUser();
  return <AppShell userId={user.id} userName={user.name ?? "Developer"}>{children}</AppShell>;
}
