import { useState } from "react";
import { ArrowRight, Check, Clock, Copy } from "lucide-react";
import type { LocalCurrency } from "@/config/rates";
import { fmtLocal, fmtTime, fmtUsd } from "./format";
import QuoteExpired from "./QuoteExpired";

/** Fictional demo accounts only. None of these identifiers are real. */
const BANK_ACCOUNTS: Record<LocalCurrency, { label: string; value: string }[]> = {
  MXN: [
    { label: "CLABE", value: "000000000000000018" },
    { label: "Beneficiary", value: "Waltrex Demo SA de CV" },
    { label: "Bank", value: "Banco Ejemplo (ficticio)" },
  ],
  COP: [
    { label: "Bank", value: "Banco Ejemplo (ficticio)" },
    { label: "Account number", value: "000-000000-00" },
    { label: "Account type", value: "Ahorros" },
    { label: "Beneficiary", value: "Waltrex Demo SAS" },
  ],
};

const CopyField = ({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
        <p className={`text-sm break-all ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      <button onClick={copy} aria-label={`Copy ${label}`}
        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0">
        {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

const BankDetailsStep = ({ currency, sent, usdCredited, reference, timeLeft, onRefreshQuote, onConfirm }: {
  currency: LocalCurrency; sent: number; usdCredited: number; reference: string;
  timeLeft: number; onRefreshQuote: () => void; onConfirm: () => void;
}) => {
  if (timeLeft <= 0) return <QuoteExpired onRefresh={onRefreshQuote} />;
  return (
    <div className="animate-fade-in-up">
      <div className={`flex items-center justify-center gap-2 mb-5 py-2.5 px-5 rounded-full mx-auto w-fit ${timeLeft < 120 ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"}`}>
        <Clock className="w-4 h-4" />
        <span className="font-mono text-base font-semibold">{fmtTime(timeLeft)}</span>
        <span className="text-xs">quote locked</span>
      </div>

      <div className="text-center mb-5">
        <p className="text-sm text-muted-foreground mb-1">Transfer exactly</p>
        <p className="text-3xl font-bold font-mono">{fmtLocal(sent, currency)}</p>
        <p className="text-sm text-muted-foreground mt-1">You will receive <span className="text-foreground font-medium">{fmtUsd(usdCredited)}</span></p>
      </div>

      <div className="space-y-2 mb-3">
        {BANK_ACCOUNTS[currency].map((f) => (
          <CopyField key={f.label} label={f.label} value={f.value} mono={f.label !== "Beneficiary" && f.label !== "Bank" && f.label !== "Account type"} />
        ))}
        <CopyField label="Reference code (required)" value={reference} />
      </div>
      <p className="text-xs text-muted-foreground px-1 mb-6">
        Include the reference code in your transfer concept so we can match it. Demo account details, not real.
      </p>

      <button onClick={onConfirm} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        I've made the transfer <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default BankDetailsStep;
