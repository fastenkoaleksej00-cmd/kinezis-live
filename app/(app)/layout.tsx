import { UserDataSync } from "@/components/auth/UserDataSync";
import { AppShell } from "@/components/layout/AppShell";
import { getSessionUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <AppShell>
      <UserDataSync signedIn={Boolean(user)} />
      {children}
    </AppShell>
  );
}
