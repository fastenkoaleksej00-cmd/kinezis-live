import { Container } from "@/components/ui/Container";

/** Route-level skeleton shown while a screen's data loads. */
export default function Loading() {
  return (
    <Container as="section" className="space-y-5 py-6 sm:py-8" aria-busy="true" aria-live="polite">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-9 w-3/4" />
      <div className="skeleton aspect-[4/3] w-full rounded-3xl sm:aspect-[21/9]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="skeleton aspect-[4/5] rounded-3xl" />
        <div className="skeleton aspect-[4/5] rounded-3xl" />
        <div className="skeleton hidden aspect-[4/5] rounded-3xl sm:block" />
      </div>
    </Container>
  );
}
