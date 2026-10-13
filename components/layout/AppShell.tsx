import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";

/**
 * Responsive shell. Phones: top bar + bottom tab bar. From md: fixed sidebar.
 * Page content gets bottom padding so the tab bar never covers it.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SideNav />
      <TopBar />
      <main className="pb-24 md:pl-64 md:pb-10">{children}</main>
      <BottomNav />
    </div>
  );
}
