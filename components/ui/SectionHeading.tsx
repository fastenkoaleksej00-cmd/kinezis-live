import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
}

export function SectionHeading({ eyebrow, title, lead, action, className, as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <Tag className={Tag === "h1" ? "text-[1.9rem] leading-[1.05] font-extrabold sm:text-[2.4rem]" : "text-xl leading-tight font-bold sm:text-2xl"}>
          {title}
        </Tag>
        {lead ? <p className="text-steel mt-1.5 text-[15px] sm:text-base">{lead}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
