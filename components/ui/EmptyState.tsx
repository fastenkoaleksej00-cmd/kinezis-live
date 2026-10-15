import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Illustration, type IllustrationKind } from "./Illustration";

interface EmptyStateProps {
  icon: LucideIcon;
  /** When given, a brand SVG replaces the icon circle */
  illustration?: IllustrationKind;
  title: string;
  body?: string;
  className?: string;
  action?: React.ReactNode;
}

/** Honest empty state: says what will be here instead of faking content. */
export function EmptyState({ icon: Icon, illustration, title, body, action, className }: EmptyStateProps) {
  return (
    <div className={cn("glass flex flex-col items-center rounded-3xl px-6 py-10 text-center", className)}>
      {illustration ? (
        <Illustration kind={illustration} className="pop-in mb-3" />
      ) : (
        <span className="bg-accent-soft text-accent mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
      )}
      <p className="text-ink font-semibold">{title}</p>
      {body ? <p className="text-steel mt-1.5 max-w-sm text-sm">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
