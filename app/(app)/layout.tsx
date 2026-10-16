import { UserDataSync } from "@/components/auth/UserDataSync";
import { AppShell } from "@/components/layout/AppShell";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { MiniPlayer } from "@/components/audio/MiniPlayer";
import { getSessionUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <AudioProvider>
      <AppShell>
        <UserDataSync signedIn={Boolean(user)} />
        {children}
      </AppShell>
      <MiniPlayer />
    </AudioProvider>
  );
}
