import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "header" | "nav" | "main" | "article";
}

/** App content column: full width on phones, capped on larger screens. */
export function Container({ as: Tag = "div", className, ...props }: ContainerProps) {
  return <Tag className={cn("mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8", className)} {...props} />;
}
