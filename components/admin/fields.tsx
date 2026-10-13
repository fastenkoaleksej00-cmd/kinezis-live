import { cn } from "@/lib/utils";

const base =
  "border-ink/10 text-ink placeholder:text-steel/60 focus:border-accent/50 w-full rounded-2xl border bg-white/80 px-4 text-[15px] outline-none transition-[border-color,box-shadow] focus:shadow-[0_0_0_3px_rgba(42,134,180,0.12)]";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="eyebrow mb-2 block">{label}</span>
      {children}
      {hint ? <span className="text-steel mt-1.5 block text-xs">{hint}</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(base, "h-12", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={cn(base, "py-3", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(base, "h-12 appearance-none", props.className)} />;
}

export function Checkbox({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="text-ink inline-flex items-center gap-2.5 text-sm font-medium">
      <input type="checkbox" {...props} className="h-4.5 w-4.5 rounded" />
      {label}
    </label>
  );
}

/** Three inputs for a LocalizedText value. English is required. */
export function LocalizedInputs({
  name,
  label,
  value,
  required = false,
  multiline = false,
}: {
  name: string;
  label: string;
  value?: { en?: string; uk?: string; de?: string } | null;
  required?: boolean;
  multiline?: boolean;
}) {
  const locales = [
    { code: "en", title: "English" },
    { code: "uk", title: "Українська" },
    { code: "de", title: "Deutsch" },
  ] as const;
  return (
    <fieldset className="space-y-2.5">
      <legend className="eyebrow mb-2">{label}</legend>
      {locales.map((l) => (
        <div key={l.code} className="flex items-start gap-2.5">
          <span className="text-steel mt-3.5 w-7 shrink-0 text-[11px] font-bold tracking-wider uppercase">{l.code}</span>
          {multiline ? (
            <Textarea name={`${name}_${l.code}`} defaultValue={value?.[l.code] ?? ""} required={required && l.code === "en"} lang={l.code} aria-label={`${label} (${l.title})`} />
          ) : (
            <Input name={`${name}_${l.code}`} defaultValue={value?.[l.code] ?? ""} required={required && l.code === "en"} lang={l.code} aria-label={`${label} (${l.title})`} />
          )}
        </div>
      ))}
    </fieldset>
  );
}
