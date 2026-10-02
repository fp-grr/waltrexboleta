import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { MIN_LOCAL_AMOUNT, usdFor, type LocalCurrency, type RateSource } from "@/config/rates";
import { IndicativeTag } from "./IndicativeTag";
import { fmtLocal, fmtLocalRate, fmtTime, fmtUsd } from "./format";
import QuoteExpired from "./QuoteExpired";

const Line = ({ label, children, strong }: { label: string; children: React.ReactNode; strong?: boolean }) => (
  <div className={`flex justify-between gap-4 ${strong ? "font-semibold" : ""}`}>
    <span className="text-muted-foreground font-normal">{label}</span>
    <span className="font-mono text-right">{children}</span>
  </div>
);

const BankAmountStep = ({ currency, rate, source, initial, timeLeft, onRefreshQuote, onSubmit }: {
  currency: LocalCurrency; rate: number; source: RateSource; initial: number; timeLeft: number;
  onRefreshQuote: () => void; onSubmit: (amount: number) => void;
}) => {
  const [value, setValue] = useState(initial > 0 ? String(initial) : "");
  const amount = parseFloat(value);
  const min = MIN_LOCAL_AMOUNT[currency];
  const hasAmount = Number.isFinite(amount) && amount > 0;
  const tooLow = hasAmount && amount < min;
  const valid = hasAmount && !tooLow;
  const usdCredited = usdFor(hasAmount ? amount : 0, rate);

  if (timeLeft <= 0) return <QuoteExpired onRefresh={onRefreshQuote} />;

  return (
    <div className="animate-fade-in-up">
      <p className="text-sm text-muted-foreground mb-4">How much will you send?</p>
      <div className={`flex items-center gap-3 bg-secondary rounded-xl border px-4 py-3 mb-2 ${tooLow ? "border-destructive" : "border-border focus-within:border-primary"}`}>
        <input
          autoFocus inputMode="numeric" value={value} placeholder="0"
          onChange={(e) => /^\d*$/.test(e.target.value) && setValue(e.target.value)}
          className="flex-1 bg-transparent outline-none text-3xl font-bold font-mono min-w-0"
        />
        <span className="text-sm text-muted-foreground font-mono">{currency}</span>
      </div>
      <p className={`text-xs mb-5 px-1 ${tooLow ? "text-destructive" : "text-muted-foreground"}`}>
        {tooLow ? `Minimum transfer is ${fmtLocal(min, currency)}.` : `Minimum ${fmtLocal(min, currency)}`}
      </p>

      <div className="bg-secondary rounded-xl p-4 mb-3 space-y-2 text-sm">
        <Line label="You send">{hasAmount ? fmtLocal(amount, currency) : `— ${currency}`}</Line>
        <Line label="Rate">{fmtLocalRate(rate, currency)} <span className="text-muted-foreground">(mid-market)</span><IndicativeTag source={source} /></Line>
        <div className="h-px bg-border" />
        <Line label="You receive" strong><span className="text-primary">{valid ? fmtUsd(usdCredited) : "—"}</span></Line>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mb-1.5">
        <span className={`flex items-center gap-1.5 ${timeLeft < 120 ? "text-destructive" : ""}`}>
          <Clock className="w-3.5 h-3.5" /> Quote locked for <span className="font-mono font-semibold">{fmtTime(timeLeft)}</span>
        </span>
        <span className="text-success">No fees</span>
      </div>
      <p className="text-[10px] text-muted-foreground px-1 mb-6">Mid-market rate via ExchangeRate-API</p>

      <button disabled={!valid} onClick={() => onSubmit(amount)}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default BankAmountStep;
