import { UserDataSync } from "@/components/auth/UserDataSync";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <UserDataSync />
      {children}
    </AppShell>
  );
}
