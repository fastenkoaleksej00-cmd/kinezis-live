/**
 * Re-mounts on every navigation, so the enter animation plays for each screen.
 * Pure CSS (see .page-enter in globals.css): no JS cost, respects reduced motion.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
