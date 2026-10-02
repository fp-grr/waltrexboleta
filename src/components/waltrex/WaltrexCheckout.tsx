import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Shield, X } from "lucide-react";
import { BANK_QUOTE_TTL_SECONDS, quote as bankQuoteFor, usdFor, type BankQuote, type LocalCurrency, type RateSource } from "@/config/rates";
import { fetchRates, getCachedRates, type RateSnapshot } from "@/lib/rates";
import { ASSETS, DETECT_DELAY_MS, QUOTE_DRIFT, QUOTE_TTL_SECONDS, rateFor, type Asset, type Network } from "./rates";
import type { CheckoutStep, Quote, Settlement, WaltrexCheckoutConfig } from "./types";
import { fmtMoney, randomHex, round2 } from "./format";
import AmountStep from "./AmountStep";
import MethodStep, { type MethodId } from "./MethodStep";
import AssetStep from "./AssetStep";
import PayStep from "./PayStep";
import DetectingStep from "./DetectingStep";
import CompleteStep from "./CompleteStep";
import BankCurrencyStep from "./BankCurrencyStep";
import BankAmountStep from "./BankAmountStep";
import BankDetailsStep from "./BankDetailsStep";

export interface WaltrexCheckoutProps {
  open: boolean;
  onClose: () => void;
  config: WaltrexCheckoutConfig;
  /** Required when config.amountMode === "fixed" (in settleCurrency, before fee). */
  amount?: number;
  /** Short line shown in the summary strip, e.g. "2× VIP Experience". */
  summaryLabel?: string;
  /** Fires once when a payment completes. */
  onComplete?: (settlement: Settlement) => void;
}

const TITLES: Record<CheckoutStep, string> = {
  amount: "Deposit",
  method: "Payment",
  asset: "Select crypto",
  pay: "Send payment",
  detecting: "Confirming…",
  complete: "Confirmed!",
  currency: "Local bank transfer",
  "bank-amount": "Amount",
  "bank-details": "Bank transfer",
  "bank-confirming": "Confirming…",
};

const BANK_CONFIRM_CHECKS = 5;

interface LockedBankQuote extends BankQuote {
  currency: LocalCurrency;
  sent: number;
  reference: string;
}

const WaltrexCheckout = ({ open, onClose, config, amount: fixedAmount = 0, summaryLabel, onComplete }: WaltrexCheckoutProps) => {
  // With bank transfer enabled the method is chosen first; the crypto path then asks for the amount.
  const methodFirst = !!config.bankTransfer;
  const firstStep: CheckoutStep = config.amountMode === "user-input" && !methodFirst ? "amount" : "method";
  const assets = useMemo(() => ASSETS.filter((a) => Number.isFinite(rateFor(a, config.settleCurrency))), [config.settleCurrency]);

  const [step, setStep] = useState<CheckoutStep>(firstStep);
  const [amount, setAmount] = useState(fixedAmount);
  const [asset, setAsset] = useState<Asset>(assets[0]);
  const [network, setNetwork] = useState<Network>(assets[0].networks[0]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [now, setNow] = useState(Date.now());
  const [confirmations, setConfirmations] = useState(0);
  const [settlement, setSettlement] = useState<Settlement | null>(null);

  // Bank transfer state
  const [bankCur, setBankCur] = useState<LocalCurrency>("MXN");
  const [rateSnap, setRateSnap] = useState<RateSnapshot | null>(() => getCachedRates());
  const [bankLock, setBankLock] = useState<{ id: number; expiresAt: number; rate: number; source: RateSource } | null>(null);
  const [bankQuote, setBankQuote] = useState<LockedBankQuote | null>(null);
  const [bankAmountDraft, setBankAmountDraft] = useState(0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const fee = round2(amount * config.feePct);
  const total = round2(amount + fee);
  const requiredConfs = Math.min(network.confirmations, 6);

  const makeQuote = useCallback((a: Asset, totalDue: number, refresh: boolean): Quote => {
    const drift = config.fxEnabled && refresh ? (Math.random() * 2 - 1) * QUOTE_DRIFT : 0;
    const rate = rateFor(a, config.settleCurrency, drift);
    return { rate, payAmount: totalDue / rate, issuedAt: Date.now(), id: Math.random() };
  }, [config.fxEnabled, config.settleCurrency]);

  // Reset whenever the module opens
  useEffect(() => {
    if (!open) return;
    setStep(firstStep);
    setAmount(fixedAmount);
    setAsset(assets[0]);
    setNetwork(assets[0].networks[0]);
    setQuote(null);
    setConfirmations(0);
    setSettlement(null);
    setBankLock(null);
    setBankQuote(null);
    setBankAmountDraft(0);
    // Rates are fetched once per open (cached 30 min in fetchRates), never per keystroke
    if (config.bankTransfer) {
      let live = true;
      fetchRates().then((s) => live && setRateSnap(s));
      return () => { live = false; };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep a fixed amount in sync with the caller while still on the first screens
  useEffect(() => {
    if (open && config.amountMode === "fixed" && step === "method") setAmount(fixedAmount);
  }, [open, config.amountMode, fixedAmount, step]);

  // Quote clock (crypto pay + bank amount/details)
  useEffect(() => {
    if (step !== "pay" && step !== "bank-amount" && step !== "bank-details") return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step, quote?.id, bankLock?.id]);

  const timeLeft = quote ? Math.max(0, QUOTE_TTL_SECONDS - Math.floor((now - quote.issuedAt) / 1000)) : 0;
  const expired = step === "pay" && !!quote && timeLeft <= 0;
  const bankTimeLeft = bankLock
    ? Math.min(BANK_QUOTE_TTL_SECONDS, Math.max(0, Math.ceil((bankLock.expiresAt - now) / 1000)))
    : 0;

  // Simulated on-chain detection (replaces the manual "I've sent it" button)
  useEffect(() => {
    if (step !== "pay" || !quote || expired) return;
    const [min, max] = DETECT_DELAY_MS;
    const t = setTimeout(() => setStep("detecting"), min + Math.random() * (max - min));
    return () => clearTimeout(t);
  }, [step, quote, expired]);

  // Confirmations -> complete
  useEffect(() => {
    if (step !== "detecting" || !quote) return;
    setConfirmations(0);
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setConfirmations(n);
      if (n >= requiredConfs) {
        clearInterval(t);
        const s: Settlement = {
          method: "crypto",
          asset: asset.symbol,
          networkLabel: network.label,
          paidAmount: quote.payAmount,
          rate: quote.rate,
          settleCurrency: config.settleCurrency,
          amount,
          fee,
          received: amount,
          fxEnabled: config.fxEnabled,
          txHash: "0x" + randomHex(64),
          orderId: "WX-" + Math.floor(10000 + Math.random() * 90000),
        };
        setTimeout(() => {
          setSettlement(s);
          setStep("complete");
          onCompleteRef.current?.(s);
        }, 500);
      }
    }, 700);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Bank transfer confirming -> complete
  useEffect(() => {
    if (step !== "bank-confirming" || !bankQuote) return;
    setConfirmations(0);
    let n = 0;
    let done: ReturnType<typeof setTimeout> | undefined;
    const t = setInterval(() => {
      n += 1;
      setConfirmations(n);
      if (n >= BANK_CONFIRM_CHECKS) {
        clearInterval(t);
        const s: Settlement = {
          method: "bank",
          currency: bankQuote.currency,
          sent: bankQuote.sent,
          rate: bankQuote.rate,
          settleCurrency: "USD",
          received: bankQuote.usdCredited,
          reference: bankQuote.reference,
          source: bankQuote.source,
          orderId: "WX-" + Math.floor(10000 + Math.random() * 90000),
        };
        done = setTimeout(() => {
          setSettlement(s);
          setStep("complete");
          onCompleteRef.current?.(s);
        }, 500);
      }
    }, 700);
    return () => { clearInterval(t); if (done) clearTimeout(done); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const pickAsset = (a: Asset) => { setAsset(a); setNetwork(a.networks[0]); };

  const goToPay = () => { setQuote(makeQuote(asset, total, false)); setStep("pay"); };
  const refreshQuote = () => setQuote(makeQuote(asset, total, true));

  const newBankLock = (cur: LocalCurrency, snap: RateSnapshot | null) => {
    const q = bankQuoteFor(0, cur, snap);
    setNow(Date.now());
    setBankLock({ id: Math.random(), expiresAt: q.expiresAt, rate: q.rate, source: q.source });
  };
  const pickBankCurrency = (cur: LocalCurrency) => {
    setBankCur(cur);
    setBankAmountDraft(0);
    newBankLock(cur, rateSnap);
    setStep("bank-amount");
  };
  const submitBankAmount = (local: number) => {
    if (!bankLock) return;
    const reference = "WX-" + randomHex(6).toUpperCase();
    setBankAmountDraft(local);
    setBankQuote({ rate: bankLock.rate, source: bankLock.source, usdCredited: usdFor(local, bankLock.rate), expiresAt: bankLock.expiresAt, currency: bankCur, sent: local, reference });
    setStep("bank-details");
  };
  // Re-reads the cache (fetchRates only hits the network if the 30 min cache is stale)
  const refreshBankQuote = async () => {
    const snap = await fetchRates();
    setRateSnap(snap);
    newBankLock(bankCur, snap);
    setStep("bank-amount");
  };

  const selectMethod = (m: MethodId) => {
    if (m === "bank") setStep("currency");
    else if (config.amountMode === "user-input" && amount <= 0) setStep("amount");
    else setStep("asset");
  };

  const goBack = () => {
    if (step === "asset") setStep(methodFirst && config.amountMode === "user-input" ? "amount" : "method");
    else if (step === "amount" && methodFirst) setStep("method");
    else if (step === "method" && config.amountMode === "user-input" && !methodFirst) setStep("amount");
    else if (step === "pay") setStep("asset");
    else if (step === "currency") setStep("method");
    else if (step === "bank-amount") setStep("currency");
    else if (step === "bank-details") setStep("bank-amount");
  };
  const canGoBack =
    step === "asset" || step === "pay" || step === "currency" || step === "bank-amount" || step === "bank-details" ||
    (step === "amount" && methodFirst) ||
    (step === "method" && config.amountMode === "user-input" && !methodFirst);

  const isBankStep = step === "currency" || step === "bank-amount" || step === "bank-details" || step === "bank-confirming";

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col animate-fade-in-up" style={{ animationDuration: "0.3s" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {canGoBack && (
              <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold">{TITLES[step]}</h2>
          </div>
          {step !== "detecting" && step !== "bank-confirming" && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {step !== "complete" && step !== "amount" && !isBankStep && amount > 0 && (
          <div className="px-6 py-3 bg-secondary/50 border-b border-border flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{summaryLabel ?? config.merchantName}</span>
            <span className="font-semibold font-mono">{fmtMoney(total, config.settleCurrency)}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === "amount" && (
            <AmountStep config={config} initial={amount} onSubmit={(a) => { setAmount(a); setStep(methodFirst ? "asset" : "method"); }} />
          )}
          {step === "method" && (
            <MethodStep config={config} amount={amount} fee={fee} total={total} onSelect={selectMethod} />
          )}
          {step === "asset" && (
            <AssetStep config={config} assets={assets} total={total} asset={asset} network={network}
              onAsset={pickAsset} onNetwork={setNetwork} onProceed={goToPay} />
          )}
          {step === "pay" && quote && (
            <PayStep config={config} asset={asset} network={network} quote={quote} total={total}
              timeLeft={timeLeft} onRefreshQuote={refreshQuote} />
          )}
          {step === "detecting" && <DetectingStep symbol={asset.symbol} confirmations={confirmations} required={requiredConfs} />}

          {step === "currency" && config.bankTransfer && (
            <BankCurrencyStep currencies={config.bankTransfer.currencies} snapshot={rateSnap} onSelect={pickBankCurrency} />
          )}
          {step === "bank-amount" && (
            <BankAmountStep currency={bankCur} rate={bankLock?.rate ?? 0} source={bankLock?.source ?? "fallback"} initial={bankAmountDraft} timeLeft={bankTimeLeft}
              onRefreshQuote={refreshBankQuote} onSubmit={submitBankAmount} />
          )}
          {step === "bank-details" && bankQuote && (
            <BankDetailsStep currency={bankQuote.currency} sent={bankQuote.sent} usdCredited={bankQuote.usdCredited}
              reference={bankQuote.reference} timeLeft={bankTimeLeft} onRefreshQuote={refreshBankQuote}
              onConfirm={() => setStep("bank-confirming")} />
          )}
          {step === "bank-confirming" && (
            <DetectingStep title="Verifying transfer" subtitle="Matching your transfer with your reference code…"
              confirmations={confirmations} required={BANK_CONFIRM_CHECKS} unit="checks" />
          )}

          {step === "complete" && settlement && <CompleteStep config={config} settlement={settlement} onClose={onClose} />}
        </div>

        {(step === "pay" || step === "detecting" || step === "bank-details" || step === "bank-confirming" || step === "complete") && (
          <div className="px-6 py-3 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Powered by <span className="text-gradient-green font-semibold">waltrex</span></span>
          </div>
        )}
      </div>
    </>
  );
};

export default WaltrexCheckout;
