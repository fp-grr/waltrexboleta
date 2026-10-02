import { ArrowRight, Building2, CreditCard, Landmark, Wallet } from "lucide-react";
import type { WaltrexCheckoutConfig } from "./types";
import { fmtMoney } from "./format";

export type MethodId = "bank" | "crypto";

const MethodStep = ({ config, amount, fee, total, onSelect }: {
  config: WaltrexCheckoutConfig; amount: number; fee: number; total: number; onSelect: (m: MethodId) => void;
}) => {
  const cur = config.settleCurrency;
  const bankOn = !!config.bankTransfer?.fxEnabled;
  const crypto = { id: "crypto", label: "Cryptocurrency", sub: config.fxEnabled ? "USDT, USDC, BTC, ETH, SOL — instant settlement" : "USDT — credited 1:1", icon: Wallet, disabled: false };
  const card = { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, AMEX", icon: CreditCard, disabled: true };
  const methods = bankOn
    ? [
        { id: "bank", label: "Local bank transfer", sub: "MXN, COP, auto-converted to USD", icon: Landmark, disabled: false },
        crypto,
        card,
      ]
    : [card, { id: "spei", label: "SPEI Transfer", sub: "Mexican bank transfer", icon: Building2, disabled: true }, crypto];

  return (
    <div className="animate-fade-in-up">
      {amount > 0 && (
        <div className="bg-secondary rounded-xl p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{fmtMoney(amount, cur)}</span></div>
          {config.feePct > 0 && (
            <div className="flex justify-between"><span className="text-muted-foreground">Service fee ({(config.feePct * 100).toFixed(0)}%)</span><span className="font-mono">{fmtMoney(fee, cur)}</span></div>
          )}
          <div className="h-px bg-border" />
          <div className="flex justify-between font-semibold"><span>Total</span><span className="font-mono text-primary">{fmtMoney(total, cur)}</span></div>
        </div>
      )}
      <p className="text-sm text-muted-foreground mb-4">Choose payment method</p>
      <div className="space-y-3">
        {methods.map((m) => (
          <button key={m.id} onClick={() => !m.disabled && onSelect(m.id as MethodId)} disabled={m.disabled}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              m.disabled ? "border-border bg-secondary/50 opacity-40 cursor-not-allowed" : "border-border bg-secondary hover:border-primary hover:glow-green cursor-pointer"
            }`}>
            <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0"><m.icon className="w-5 h-5 text-muted-foreground" /></div>
            <div className="flex-1"><p className="text-sm font-medium">{m.label}</p><p className="text-xs text-muted-foreground">{m.sub}</p></div>
            {m.disabled ? <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Soon</span> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MethodStep;
