import { useState, useEffect } from "react";
import { Check, Copy, Clock, ArrowRight, Shield, Zap } from "lucide-react";

const MOCK_WALLET = "TXqH7sVnEi4bK2uPfJ8mNzR3dWcYa6gLQ9";
const RATE = 17.42; // 1 USDT = 17.42 MXN
const DEPOSIT_AMOUNT = 500; // USDT

type Step = "amount" | "address" | "confirming" | "complete";

const DepositFlow = () => {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("500");
  const [copied, setCopied] = useState(false);
  const [confirmProgress, setConfirmProgress] = useState(0);
  const [confirmations, setConfirmations] = useState(0);

  const numAmount = parseFloat(amount) || 0;
  const mxnAmount = (numAmount * RATE).toFixed(2);

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceed = () => {
    if (step === "amount" && numAmount > 0) setStep("address");
    else if (step === "address") setStep("confirming");
  };

  useEffect(() => {
    if (step !== "confirming") return;
    const interval = setInterval(() => {
      setConfirmProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setStep("complete");
          return 100;
        }
        return p + 2;
      });
      setConfirmations((c) => Math.min(c + 1, 19));
    }, 150);
    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">TradeMax</span>
          <span className="text-xs text-muted-foreground ml-2 px-2 py-0.5 rounded-full bg-secondary">DEMO</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Balance: <span className="text-foreground font-medium">$12,450.00 MXN</span></span>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground">JD</div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* Card */}
          <div className="mt-6 rounded-2xl bg-card border border-border p-6 glow-green">
            {step === "amount" && (
              <AmountStep
                amount={amount}
                setAmount={setAmount}
                mxnAmount={mxnAmount}
                rate={RATE}
                onProceed={handleProceed}
              />
            )}
            {step === "address" && (
              <AddressStep
                amount={numAmount}
                mxnAmount={mxnAmount}
                wallet={MOCK_WALLET}
                copied={copied}
                onCopy={handleCopy}
                onConfirm={handleProceed}
              />
            )}
            {step === "confirming" && (
              <ConfirmingStep
                progress={confirmProgress}
                confirmations={confirmations}
                amount={numAmount}
              />
            )}
            {step === "complete" && (
              <CompleteStep amount={numAmount} mxnAmount={mxnAmount} />
            )}
          </div>

          {/* Footer info */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Powered by <span className="text-gradient-green font-semibold">Wally</span> + <span className="text-gradient-green font-semibold">Alter</span></span>
          </div>
        </div>
      </main>
    </div>
  );
};

/* Sub-components */

const StepIndicator = ({ current }: { current: Step }) => {
  const steps: { key: Step; label: string }[] = [
    { key: "amount", label: "Amount" },
    { key: "address", label: "Send" },
    { key: "confirming", label: "Confirming" },
    { key: "complete", label: "Done" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                i < currentIdx
                  ? "bg-primary text-primary-foreground"
                  : i === currentIdx
                  ? "bg-primary text-primary-foreground glow-green-strong"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < currentIdx ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 ${i <= currentIdx ? "text-foreground" : "text-muted-foreground"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px flex-1 mx-1 mb-4 transition-colors duration-300 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const AmountStep = ({
  amount,
  setAmount,
  mxnAmount,
  rate,
  onProceed,
}: {
  amount: string;
  setAmount: (v: string) => void;
  mxnAmount: string;
  rate: number;
  onProceed: () => void;
}) => (
  <div className="animate-fade-in-up">
    <h2 className="text-xl font-semibold mb-1">Deposit USDT</h2>
    <p className="text-sm text-muted-foreground mb-6">Via TRON (TRC-20) network</p>

    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">You send</label>
    <div className="flex items-center gap-3 bg-secondary rounded-xl p-4 mb-4">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="flex-1 bg-transparent text-2xl font-semibold outline-none text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder="0.00"
      />
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
        <div className="w-5 h-5 rounded-full bg-[hsl(168,70%,45%)] flex items-center justify-center text-[8px] font-bold text-primary-foreground">₮</div>
        <span className="text-sm font-medium">USDT</span>
      </div>
    </div>

    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Platform receives</label>
    <div className="flex items-center gap-3 bg-secondary rounded-xl p-4 mb-2">
      <span className="flex-1 text-2xl font-semibold text-foreground">{mxnAmount}</span>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
        <span className="text-sm">🇲🇽</span>
        <span className="text-sm font-medium">MXN</span>
      </div>
    </div>

    <div className="flex items-center justify-between text-xs text-muted-foreground mb-6 px-1">
      <span>Rate powered by Alter</span>
      <span className="font-mono">1 USDT = {rate.toFixed(2)} MXN</span>
    </div>

    <button
      onClick={onProceed}
      disabled={!parseFloat(amount)}
      className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      Continue <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

const AddressStep = ({
  amount,
  mxnAmount,
  wallet,
  copied,
  onCopy,
  onConfirm,
}: {
  amount: number;
  mxnAmount: string;
  wallet: string;
  copied: boolean;
  onCopy: () => void;
  onConfirm: () => void;
}) => (
  <div className="animate-fade-in-up">
    <h2 className="text-xl font-semibold mb-1">Send USDT</h2>
    <p className="text-sm text-muted-foreground mb-6">
      Transfer exactly <span className="text-foreground font-medium">{amount} USDT</span> to the address below
    </p>

    {/* QR placeholder */}
    <div className="mx-auto w-44 h-44 rounded-2xl bg-foreground p-3 mb-5">
      <div className="w-full h-full rounded-xl bg-background flex items-center justify-center">
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-sm ${
                [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,8,16,18,12].includes(i)
                  ? "bg-foreground"
                  : "bg-background"
              }`}
            />
          ))}
        </div>
      </div>
    </div>

    {/* Wallet address */}
    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Wallet address (TRC-20)</label>
    <div
      onClick={onCopy}
      className="flex items-center gap-2 bg-secondary rounded-xl p-4 mb-2 cursor-pointer hover:bg-[hsl(var(--surface-hover))] transition-colors group"
    >
      <span className="flex-1 font-mono text-sm text-foreground break-all">{wallet}</span>
      {copied ? (
        <Check className="w-4 h-4 text-success shrink-0" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
      )}
    </div>
    <p className="text-xs text-muted-foreground mb-1 px-1">
      {copied ? (
        <span className="text-success">Copied to clipboard!</span>
      ) : (
        "Tap to copy"
      )}
    </p>

    <div className="text-xs text-muted-foreground mb-6 mt-4 space-y-1 px-1">
      <div className="flex justify-between">
        <span>Network</span>
        <span className="text-foreground font-medium">TRON (TRC-20)</span>
      </div>
      <div className="flex justify-between">
        <span>You receive</span>
        <span className="text-foreground font-medium">${mxnAmount} MXN</span>
      </div>
      <div className="flex justify-between">
        <span>Address generated by</span>
        <span className="text-gradient-green font-semibold">Wally</span>
      </div>
    </div>

    <button
      onClick={onConfirm}
      className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
    >
      I've sent the payment <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

const ConfirmingStep = ({
  progress,
  confirmations,
  amount,
}: {
  progress: number;
  confirmations: number;
  amount: number;
}) => (
  <div className="animate-fade-in-up text-center py-4">
    <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-5 flex items-center justify-center">
      <Clock className="w-7 h-7 text-primary animate-pulse-slow" />
    </div>
    <h2 className="text-xl font-semibold mb-1">Confirming transaction</h2>
    <p className="text-sm text-muted-foreground mb-6">
      Detecting {amount} USDT on TRON network
    </p>

    {/* Progress bar */}
    <div className="w-full h-2 rounded-full bg-secondary mb-3 overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="flex justify-between text-xs text-muted-foreground px-1">
      <span>Confirmations: <span className="text-foreground font-mono">{confirmations}/19</span></span>
      <span className="font-mono">{progress}%</span>
    </div>
  </div>
);

const CompleteStep = ({ amount, mxnAmount }: { amount: number; mxnAmount: string }) => (
  <div className="animate-fade-in-up text-center py-4">
    <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-5 flex items-center justify-center glow-green-strong">
      <Check className="w-8 h-8 text-primary-foreground" />
    </div>
    <h2 className="text-xl font-semibold mb-1">Deposit complete</h2>
    <p className="text-sm text-muted-foreground mb-6">
      Your balance has been credited
    </p>

    <div className="bg-secondary rounded-xl p-4 mb-4 space-y-3 text-left">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Sent</span>
        <span className="font-medium font-mono">{amount} USDT</span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Credited</span>
        <span className="font-medium font-mono text-success">${mxnAmount} MXN</span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">TX Hash</span>
        <span className="font-mono text-xs text-muted-foreground">a3f8...7e2b</span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Conversion</span>
        <span className="text-gradient-green font-semibold text-xs">Alter</span>
      </div>
    </div>

    <button
      onClick={() => window.location.reload()}
      className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
    >
      Done
    </button>
  </div>
);

export default DepositFlow;
