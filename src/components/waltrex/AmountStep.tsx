import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { WaltrexCheckoutConfig } from "./types";

const PRESETS = [100, 500, 1000, 5000];

const AmountStep = ({ config, initial, onSubmit }: {
  config: WaltrexCheckoutConfig; initial: number; onSubmit: (amount: number) => void;
}) => {
  const [value, setValue] = useState(initial > 0 ? String(initial) : "");
  const amount = parseFloat(value);
  const valid = Number.isFinite(amount) && amount >= 10;

  return (
    <div className="animate-fade-in-up">
      <p className="text-sm text-muted-foreground mb-4">How much do you want to deposit?</p>
      <div className="flex items-center gap-3 bg-secondary rounded-xl border border-border focus-within:border-primary px-4 py-3 mb-3">
        <input
          autoFocus inputMode="decimal" value={value} placeholder="0.00"
          onChange={(e) => /^\d*\.?\d{0,2}$/.test(e.target.value) && setValue(e.target.value)}
          className="flex-1 bg-transparent outline-none text-3xl font-bold font-mono min-w-0"
        />
        <span className="text-sm text-muted-foreground font-mono">{config.settleCurrency}</span>
      </div>
      <div className="flex gap-2 mb-2">
        {PRESETS.map((p) => (
          <button key={p} onClick={() => setValue(String(p))}
            className="flex-1 py-2 rounded-lg bg-secondary hover:bg-muted text-xs font-mono transition-colors">
            {p.toLocaleString()}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mb-6 px-1">
        Minimum 10 {config.settleCurrency}{!config.fxEnabled && " · Credited 1:1, no conversion"}
      </p>
      <button disabled={!valid} onClick={() => onSubmit(amount)}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AmountStep;
