import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Copy, Clock, ArrowRight, CreditCard, Building2, Wallet, X, ChevronLeft, Shield } from "lucide-react";

const CRYPTO_OPTIONS = [
  { symbol: "USDT", name: "Tether", network: "TRC-20", rate: 17.42, icon: "₮", color: "168 70% 45%" },
  { symbol: "USDC", name: "USD Coin", network: "ERC-20", rate: 17.40, icon: "◎", color: "220 70% 55%" },
  { symbol: "BTC", name: "Bitcoin", network: "Lightning", rate: 1_720_000, icon: "₿", color: "33 90% 55%" },
];

const MOCK_WALLETS: Record<string, string> = {
  USDT: "TXqH7sVnEi4bK2uPfJ8mNzR3dWcYa6gLQ9",
  USDC: "0x8a2Ed9c41F7b28eAf4C7d91bA03e7912",
  BTC: "lnbc1062n1pjk4wm2qzv4w9xk3r7p",
};

type Step = "method" | "crypto-select" | "crypto-pay" | "confirming" | "complete";
const TIMER_SECONDS = 600;

interface CheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  ticketType: string;
  quantity: number;
  unitPrice: number;
}

const CheckoutDrawer = ({ open, onClose, ticketType, quantity, unitPrice }: CheckoutDrawerProps) => {
  const [step, setStep] = useState<Step>("method");
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_OPTIONS[0]);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [confirmProgress, setConfirmProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPrice = unitPrice * quantity;
  const serviceFee = Math.round(totalPrice * 0.08);
  const grandTotal = totalPrice + serviceFee;
  const cryptoAmount = (grandTotal / selectedCrypto.rate).toFixed(selectedCrypto.symbol === "BTC" ? 6 : 2);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(MOCK_WALLETS[selectedCrypto.symbol]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [selectedCrypto]);

  // Reset on open
  useEffect(() => {
    if (open) { setStep("method"); setConfirmProgress(0); setTimeLeft(TIMER_SECONDS); }
  }, [open]);

  // Timer
  useEffect(() => {
    if (step !== "crypto-pay") return;
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current!); return 0; } return t - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  // Confirming
  useEffect(() => {
    if (step !== "confirming") return;
    setConfirmProgress(0);
    const interval = setInterval(() => {
      setConfirmProgress((p) => { if (p >= 100) { clearInterval(interval); setStep("complete"); return 100; } return p + 2.5; });
    }, 120);
    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const goBack = () => {
    const map: Partial<Record<Step, Step>> = { "crypto-select": "method", "crypto-pay": "crypto-select" };
    const prev = map[step];
    if (prev) setStep(prev);
    else onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {step !== "method" && step !== "confirming" && step !== "complete" && (
              <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold">
              {step === "method" && "Payment"}
              {step === "crypto-select" && "Select crypto"}
              {step === "crypto-pay" && "Send payment"}
              {step === "confirming" && "Verifying…"}
              {step === "complete" && "Confirmed!"}
            </h2>
          </div>
          {step !== "confirming" && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Order summary strip */}
        {step !== "complete" && (
          <div className="px-6 py-3 bg-secondary/50 border-b border-border flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">{quantity}× {ticketType}</span>
            </div>
            <span className="font-semibold font-mono">${grandTotal.toLocaleString()} MXN</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === "method" && (
            <MethodStep
              totalPrice={totalPrice}
              serviceFee={serviceFee}
              grandTotal={grandTotal}
              onSelect={(m) => { if (m === "crypto") setStep("crypto-select"); }}
            />
          )}
          {step === "crypto-select" && (
            <CryptoSelectStep
              selected={selectedCrypto}
              onSelect={setSelectedCrypto}
              onProceed={() => setStep("crypto-pay")}
              price={grandTotal}
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
          {step === "complete" && (
            <CompleteStep
              crypto={selectedCrypto}
              cryptoAmount={cryptoAmount}
              grandTotal={grandTotal}
              ticketType={ticketType}
              quantity={quantity}
              onClose={onClose}
            />
          )}
        </div>

        {/* Footer */}
        {(step === "crypto-pay" || step === "confirming" || step === "complete") && (
          <div className="px-6 py-3 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Powered by <span className="text-gradient-green font-semibold">waltrex</span></span>
          </div>
        )}
      </div>
    </>
  );
};

/* ─── Sub-components ─── */

const MethodStep = ({ totalPrice, serviceFee, grandTotal, onSelect }: {
  totalPrice: number; serviceFee: number; grandTotal: number;
  onSelect: (m: string) => void;
}) => {
  const methods = [
    { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, AMEX", icon: CreditCard, disabled: true },
    { id: "spei", label: "SPEI Transfer", sub: "Mexican bank transfer", icon: Building2, disabled: true },
    { id: "crypto", label: "Cryptocurrency", sub: "USDT, USDC, BTC — instant settlement", icon: Wallet, disabled: false },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Price breakdown */}
      <div className="bg-secondary rounded-xl p-4 mb-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono">${totalPrice.toLocaleString()} MXN</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service fee</span>
          <span className="font-mono">${serviceFee.toLocaleString()} MXN</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="font-mono text-primary">${grandTotal.toLocaleString()} MXN</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">Choose payment method</p>

      <div className="space-y-3">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => !m.disabled && onSelect(m.id)}
            disabled={m.disabled}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              m.disabled
                ? "border-border bg-secondary/50 opacity-40 cursor-not-allowed"
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

const CryptoSelectStep = ({ selected, onSelect, onProceed, price }: {
  selected: typeof CRYPTO_OPTIONS[0];
  onSelect: (c: typeof CRYPTO_OPTIONS[0]) => void;
  onProceed: () => void;
  price: number;
}) => (
  <div className="animate-fade-in-up">
    <p className="text-sm text-muted-foreground mb-5">Select cryptocurrency to pay <span className="text-foreground font-medium">${price.toLocaleString()} MXN</span></p>

    <div className="space-y-2 mb-6">
      {CRYPTO_OPTIONS.map((c) => {
        const amt = (price / c.rate).toFixed(c.symbol === "BTC" ? 6 : 2);
        const isSelected = selected.symbol === c.symbol;
        return (
          <button key={c.symbol} onClick={() => onSelect(c)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              isSelected ? "border-primary glow-green bg-secondary" : "border-border bg-secondary hover:border-border/80"
            }`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: `hsl(${c.color} / 0.15)`, color: `hsl(${c.color})` }}>{c.icon}</div>
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
      Pay with {selected.symbol} <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

const CryptoPayStep = ({ crypto, amount, wallet, timeLeft, formatTime, copied, onCopy, onConfirm }: {
  crypto: typeof CRYPTO_OPTIONS[0]; amount: string; wallet: string;
  timeLeft: number; formatTime: (s: number) => string;
  copied: boolean; onCopy: () => void; onConfirm: () => void;
}) => (
  <div className="animate-fade-in-up">
    {/* Timer */}
    <div className={`flex items-center justify-center gap-2 mb-6 py-2.5 px-5 rounded-full mx-auto w-fit ${
      timeLeft < 120 ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"
    }`}>
      <Clock className="w-4 h-4" />
      <span className="font-mono text-base font-semibold">{formatTime(timeLeft)}</span>
      <span className="text-xs">remaining</span>
    </div>

    <div className="text-center mb-6">
      <p className="text-sm text-muted-foreground mb-1">Send exactly</p>
      <p className="text-3xl font-bold font-mono">{amount} <span className="text-lg text-muted-foreground">{crypto.symbol}</span></p>
      <p className="text-sm text-muted-foreground mt-1">via {crypto.network}</p>
    </div>

    {/* QR */}
    <div className="mx-auto w-44 h-44 rounded-2xl bg-foreground p-3 mb-6">
      <div className="w-full h-full rounded-xl bg-background flex items-center justify-center">
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className={`rounded-sm ${
              [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,8,16,18,12].includes(i) ? "bg-foreground" : "bg-background"
            }`} style={{ width: 18, height: 18 }} />
          ))}
        </div>
      </div>
    </div>

    {/* Address */}
    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Wallet address</label>
    <div onClick={onCopy} className="flex items-center gap-2 bg-secondary rounded-xl p-4 mb-1 cursor-pointer hover:bg-muted transition-colors group">
      <span className="flex-1 font-mono text-sm text-foreground break-all">{wallet}</span>
      {copied ? <Check className="w-4 h-4 text-success shrink-0" /> : <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />}
    </div>
    <p className="text-xs text-muted-foreground px-1 mb-6">{copied ? <span className="text-success">Copied!</span> : "Tap to copy"}</p>

    <button onClick={onConfirm} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
      I've sent the payment <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

const ConfirmingStep = ({ progress, crypto }: { progress: number; crypto: string }) => (
  <div className="animate-fade-in-up text-center py-10">
    <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
      <Clock className="w-9 h-9 text-primary animate-pulse-slow" />
    </div>
    <h2 className="text-xl font-semibold mb-2">Verifying payment</h2>
    <p className="text-sm text-muted-foreground mb-8">Detecting {crypto} transaction on the network…</p>
    <div className="w-full h-2.5 rounded-full bg-secondary mb-3 overflow-hidden">
      <div className="h-full rounded-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
    </div>
    <span className="text-xs text-muted-foreground font-mono">{Math.round(progress)}%</span>
  </div>
);

const CompleteStep = ({ crypto, cryptoAmount, grandTotal, ticketType, quantity, onClose }: {
  crypto: typeof CRYPTO_OPTIONS[0]; cryptoAmount: string; grandTotal: number;
  ticketType: string; quantity: number; onClose: () => void;
}) => (
  <div className="animate-fade-in-up text-center py-6">
    <div className="w-20 h-20 rounded-full bg-primary mx-auto mb-6 flex items-center justify-center glow-green-strong">
      <Check className="w-10 h-10 text-primary-foreground" />
    </div>
    <h2 className="text-2xl font-bold mb-2">You're in!</h2>
    <p className="text-sm text-muted-foreground mb-8">Your tickets have been confirmed</p>

    <div className="bg-secondary rounded-xl p-5 mb-6 space-y-3 text-left text-sm">
      <div className="flex justify-between"><span className="text-muted-foreground">Ticket</span><span className="font-medium">{quantity}× {ticketType}</span></div>
      <div className="h-px bg-border" />
      <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="font-mono font-medium">{cryptoAmount} {crypto.symbol}</span></div>
      <div className="h-px bg-border" />
      <div className="flex justify-between"><span className="text-muted-foreground">Merchant received</span><span className="font-mono font-medium text-success">${grandTotal.toLocaleString()} MXN</span></div>
      <div className="h-px bg-border" />
      <div className="flex justify-between"><span className="text-muted-foreground">Order</span><span className="font-mono text-xs text-muted-foreground">#BM-29471</span></div>
      <div className="h-px bg-border" />
      <div className="flex justify-between"><span className="text-muted-foreground">TX hash</span><span className="font-mono text-xs text-muted-foreground">a3f8…7e2b</span></div>
    </div>

    <button onClick={onClose} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
      View my tickets
    </button>
  </div>
);

export default CheckoutDrawer;
