import type { RateSource } from "@/lib/rates";

export const IndicativeTag = ({ source }: { source: RateSource }) =>
  source === "fallback" ? (
    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground uppercase tracking-wider font-sans">indicative rate</span>
  ) : null;

export const Skeleton = ({ className = "" }: { className?: string }) => (
  <span className={`inline-block rounded bg-muted animate-pulse ${className}`} aria-hidden />
);
