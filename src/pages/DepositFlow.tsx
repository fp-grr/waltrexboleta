import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Copy, Clock, ArrowRight, CreditCard, Building2, Wallet, Ticket, ChevronLeft } from "lucide-react";

const EVENT = {
  name: "Neon Nights Festival 2026",
  date: "Sat, Mar 14 · 9:00 PM",
  venue: "Foro Sol, CDMX",
  ticketType: "General Admission",
  price: 1850,
  currency: "MXN",
};

const CRYPTO_OPTIONS = [
  { symbol: "USDT", name: "Tether", network: "TRC-20", rate: 17.42, icon: "₮", color: "168 70% 45%" },
  { symbol: "USDC", name: "USD Coin", network: "ERC-20", rate: 17.40, icon: "◎", color: "220 70% 55%" },
  { symbol: "BTC", name: "Bitcoin", network: "Lightning", rate: 1_720_000, icon: "₿", color: "33 90% 55%" },
];

const MOCK_WALLETS: Record<string, string> = {
  USDT: "TXqH7sVnEi4bK2uPfJ8mNzR3dWcYa6gLQ9",
  USDC: "0x8a2E...f4C7d91bA03e",
  BTC: "lnbc1062n1pjk...qzv4w",
};

type Step = "checkout" | "method" | "crypto-select" | "crypto-pay" | "confirming" | "complete";

const TIMER_SECONDS = 600; // 10 minutes

const DepositFlow = () => {
  const [step, setStep] = useState<Step>("checkout");
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_OPTIONS[0]);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [confirmProgress, setConfirmProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cryptoAmount = (EVENT.price / selectedCrypto.rate).toFixed(
    selectedCrypto.symbol === "BTC" ? 6 : 2
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(MOCK_WALLETS[selectedCrypto.symbol]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [selectedCrypto]);

  // Timer for crypto pay step
  useEffect(() => {
    if (step !== "crypto-pay") return;
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  // Confirming animation
  useEffect(() => {
    if (step !== "confirming") return;
    setConfirmProgress(0);
    const interval = setInterval(() => {
      setConfirmProgress((p) => {
        if (p >= 100) { clearInterval(interval); setStep("complete"); return 100; }
        return p + 2.5;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const goBack = () => {
    const backMap: Partial<Record<Step, Step>> = {
      method: "checkout",
      "crypto-select": "method",
      "crypto-pay": "crypto-select",
    };
    const prev = backMap[step];
    if (prev) setStep(prev);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Ticket className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">BoletaMX</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Order <span className="font-mono text-foreground">#BM-29471</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Back button */}
          {["method", "crypto-select", "crypto-pay"].includes(step) && (
            <button onClick={goBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          {/* Card */}
          <div className="rounded-2xl bg-card border border-border p-6 glow-green">
            {step === "checkout" && <CheckoutStep onProceed={() => setStep("method")} />}
            {step === "method" && <MethodStep onSelect={(m) => { if (m === "crypto") setStep("crypto-select"); }} />}
            {step === "crypto-select" && (
              <CryptoSelectStep
                selected={selectedCrypto}
                onSelect={setSelectedCrypto}
                onProceed={() => setStep("crypto-pay")}
                price={EVENT.price}
              />
            )}
            {step === "crypto-pay" && (
              <CryptoPayStep
                crypto={selectedCrypto}
                amount={cryptoAmount}
                wallet={MOCK_WALLETS[selectedCrypto.symbol]}
                timeLeft={timeLeft}
                formatTime={formatTime}
                copied={copied}
                onCopy={handleCopy}
                onConfirm={() => setStep("confirming")}
              />
            )}
            {step === "confirming" && <ConfirmingStep progress={confirmProgress} crypto={selectedCrypto.symbol} />}
            {step === "complete" && <CompleteStep crypto={selectedCrypto} cryptoAmount={cryptoAmount} />}
          </div>

          {/* Footer */}
          {(step === "crypto-pay" || step === "confirming" || step === "complete") && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Crypto payments by <span className="text-gradient-green font-semibold">Wally</span> · FX by <span className="text-gradient-green font-semibold">Alter</span></span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

/* ─── Sub-components ─── */

const CheckoutStep = ({ onProceed }: { onProceed: () => void }) => (
  <div className="animate-fade-in-up">
    <h2 className="text-xl font-semibold mb-4">Your order</h2>

    <div className="bg-secondary rounded-xl p-4 mb-5">
      <p className="font-semibold text-sm mb-0.5">{EVENT.name}</p>
      <p className="text-xs text-muted-foreground mb-2">{EVENT.date} · {EVENT.venue}</p>
      <div className="h-px bg-border my-3" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{EVENT.ticketType} × 1</span>
        <span className="font-mono font-medium">${EVENT.price.toLocaleString()} MXN</span>
      </div>
      <div className="flex justify-between text-sm mt-1">
        <span className="text-muted-foreground">Service fee</span>
        <span className="font-mono text-muted-foreground">$0</span>
      </div>
      <div className="h-px bg-border my-3" />
      <div className="flex justify-between text-sm font-semibold">
        <span>Total</span>
        <span className="font-mono text-primary">${EVENT.price.toLocaleString()} MXN</span>
      </div>
    </div>

    <button onClick={onProceed} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
      Pay now <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

const MethodStep = ({ onSelect }: { onSelect: (m: string) => void }) => {
  const methods = [
    { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, AMEX", icon: CreditCard, disabled: true },
    { id: "spei", label: "SPEI Transfer", sub: "Mexican bank transfer", icon: Building2, disabled: true },
    { id: "crypto", label: "Cryptocurrency", sub: "USDT, USDC, BTC — instant", icon: Wallet, disabled: false },
  ];

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl font-semibold mb-1">Payment method</h2>
      <p className="text-sm text-muted-foreground mb-5">Choose how you'd like to pay</p>

      <div className="space-y-3">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => !m.disabled && onSelect(m.id)}
            disabled={m.disabled}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              m.disabled
                ? "border-border bg-secondary/50 opacity-50 cursor-not-allowed"
                : "border-border bg-secondary hover:border-primary hover:glow-green cursor-pointer"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
              <m.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.sub}</p>
            </div>
            {m.disabled && <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Soon</span>}
            {!m.disabled && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
          </button>
        ))}
      </div>
    </div>
  );
};

const CryptoSelectStep = ({
  selected,
  onSelect,
  onProceed,
  price,
}: {
  selected: typeof CRYPTO_OPTIONS[0];
  onSelect: (c: typeof CRYPTO_OPTIONS[0]) => void;
  onProceed: () => void;
  price: number;
}) => (
  <div className="animate-fade-in-up">
    <h2 className="text-xl font-semibold mb-1">Select cryptocurrency</h2>
    <p className="text-sm text-muted-foreground mb-5">You're paying <span className="text-foreground font-medium">${price.toLocaleString()} MXN</span></p>

    <div className="space-y-2 mb-5">
      {CRYPTO_OPTIONS.map((c) => {
        const amt = (price / c.rate).toFixed(c.symbol === "BTC" ? 6 : 2);
        const isSelected = selected.symbol === c.symbol;
        return (
          <button
            key={c.symbol}
            onClick={() => onSelect(c)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              isSelected ? "border-primary glow-green bg-secondary" : "border-border bg-secondary hover:border-border/80"
            }`}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: `hsl(${c.color} / 0.15)`, color: `hsl(${c.color})` }}>
              {c.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{c.symbol} <span className="text-muted-foreground font-normal">· {c.network}</span></p>
              <p className="text-xs text-muted-foreground">{c.name}</p>
            </div>
            <span className="font-mono text-sm font-medium">{amt}</span>
          </button>
        );
      })}
    </div>

    <button onClick={onProceed} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
      Continue with {selected.symbol} <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

const CryptoPayStep = ({
  crypto,
  amount,
  wallet,
  timeLeft,
  formatTime,
  copied,
  onCopy,
  onConfirm,
}: {
  crypto: typeof CRYPTO_OPTIONS[0];
  amount: string;
  wallet: string;
  timeLeft: number;
  formatTime: (s: number) => string;
  copied: boolean;
  onCopy: () => void;
  onConfirm: () => void;
}) => (
  <div className="animate-fade-in-up">
    {/* Timer */}
    <div className={`flex items-center justify-center gap-2 mb-5 py-2 px-4 rounded-full mx-auto w-fit ${
      timeLeft < 120 ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"
    }`}>
      <Clock className="w-3.5 h-3.5" />
      <span className="font-mono text-sm font-medium">{formatTime(timeLeft)}</span>
      <span className="text-xs">remaining</span>
    </div>

    <h2 className="text-xl font-semibold mb-1 text-center">
      Send exactly <span className="font-mono">{amount} {crypto.symbol}</span>
    </h2>
    <p className="text-sm text-muted-foreground mb-5 text-center">via {crypto.network} network</p>

    {/* QR placeholder */}
    <div className="mx-auto w-40 h-40 rounded-2xl bg-foreground p-2.5 mb-5">
      <div className="w-full h-full rounded-xl bg-background flex items-center justify-center">
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className={`w-4.5 h-4.5 rounded-sm ${
              [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,8,16,18,12].includes(i)
                ? "bg-foreground" : "bg-background"
            }`} style={{ width: 18, height: 18 }} />
          ))}
        </div>
      </div>
    </div>

    {/* Address */}
    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Send to</label>
    <div onClick={onCopy} className="flex items-center gap-2 bg-secondary rounded-xl p-4 mb-1 cursor-pointer hover:bg-muted transition-colors group">
      <span className="flex-1 font-mono text-sm text-foreground break-all">{wallet}</span>
      {copied ? <Check className="w-4 h-4 text-success shrink-0" /> : <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />}
    </div>
    <p className="text-xs text-muted-foreground px-1 mb-5">
      {copied ? <span className="text-success">Copied!</span> : "Tap to copy address"}
    </p>

    <button onClick={onConfirm} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
      I've sent the payment <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

const ConfirmingStep = ({ progress, crypto }: { progress: number; crypto: string }) => (
  <div className="animate-fade-in-up text-center py-6">
    <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-5 flex items-center justify-center">
      <Clock className="w-7 h-7 text-primary animate-pulse-slow" />
    </div>
    <h2 className="text-xl font-semibold mb-1">Verifying payment</h2>
    <p className="text-sm text-muted-foreground mb-6">Detecting {crypto} transaction…</p>
    <div className="w-full h-2 rounded-full bg-secondary mb-3 overflow-hidden">
      <div className="h-full rounded-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
    </div>
    <span className="text-xs text-muted-foreground font-mono">{Math.round(progress)}%</span>
  </div>
);

const CompleteStep = ({ crypto, cryptoAmount }: { crypto: typeof CRYPTO_OPTIONS[0]; cryptoAmount: string }) => (
  <div className="animate-fade-in-up text-center py-4">
    <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-5 flex items-center justify-center glow-green-strong">
      <Check className="w-8 h-8 text-primary-foreground" />
    </div>
    <h2 className="text-xl font-semibold mb-1">Payment confirmed!</h2>
    <p className="text-sm text-muted-foreground mb-6">Your ticket is ready</p>

    <div className="bg-secondary rounded-xl p-4 mb-5 space-y-3 text-left">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Event</span>
        <span className="font-medium text-right text-xs">{EVENT.name}</span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Ticket</span>
        <span className="font-medium">{EVENT.ticketType}</span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Paid</span>
        <span className="font-mono font-medium">{cryptoAmount} {crypto.symbol}</span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Merchant received</span>
        <span className="font-mono font-medium text-success">${EVENT.price.toLocaleString()} MXN</span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">TX</span>
        <span className="font-mono text-xs text-muted-foreground">a3f8…7e2b</span>
      </div>
    </div>

    <button onClick={() => window.location.reload()} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
      View my ticket
    </button>
  </div>
);

export default DepositFlow;
