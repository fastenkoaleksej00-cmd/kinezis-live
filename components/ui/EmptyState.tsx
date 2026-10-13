import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body?: string;
  className?: string;
  action?: React.ReactNode;
}

/** Honest empty state: says what will be here instead of faking content. */
export function EmptyState({ icon: Icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div className={cn("glass flex flex-col items-center rounded-3xl px-6 py-10 text-center", className)}>
      <span className="bg-accent-soft text-accent mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="text-ink font-semibold">{title}</p>
      {body ? <p className="text-steel mt-1.5 max-w-sm text-sm">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
