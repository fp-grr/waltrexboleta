import { ArrowRight } from "lucide-react";
import type { LocalCurrency, RateSnapshot } from "@/lib/rates";
import { fmtLocalRate } from "./format";
import { IndicativeTag, Skeleton } from "./IndicativeTag";

const META: Record<LocalCurrency, { name: string; flag: string }> = {
  MXN: { name: "Mexican peso", flag: "🇲🇽" },
  COP: { name: "Colombian peso", flag: "🇨🇴" },
};

/** snapshot === null means rates are still loading. */
const BankCurrencyStep = ({ currencies, snapshot, onSelect }: {
  currencies: LocalCurrency[]; snapshot: RateSnapshot | null; onSelect: (c: LocalCurrency) => void;
}) => (
  <div className="animate-fade-in-up">
    <p className="text-sm text-muted-foreground mb-5">Which currency will you send from your bank?</p>
    <div className="space-y-3">
      {currencies.map((c) => (
        <button key={c} onClick={() => onSelect(c)} disabled={!snapshot}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary hover:border-primary hover:glow-green transition-all text-left disabled:hover:border-border disabled:hover:shadow-none disabled:cursor-wait">
          <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-lg shrink-0">{META[c].flag}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{c} <span className="text-muted-foreground font-normal">· {META[c].name}</span></p>
            <p className="text-xs text-muted-foreground font-mono h-4 flex items-center">
              {snapshot ? <>{fmtLocalRate(snapshot.rates[c], c)}<IndicativeTag source={snapshot.source} /></> : <Skeleton className="h-3 w-32" />}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  </div>
);

export default BankCurrencyStep;
