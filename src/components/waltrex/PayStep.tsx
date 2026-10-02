import { useCallback, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Clock, Copy, Loader2, RefreshCw } from "lucide-react";
import type { Asset, Network } from "./rates";
import type { Quote, WaltrexCheckoutConfig } from "./types";
import { fmtCrypto, fmtMoney, fmtTime } from "./format";

const PayStep = ({ config, asset, network, quote, total, timeLeft, onRefreshQuote }: {
  config: WaltrexCheckoutConfig; asset: Asset; network: Network; quote: Quote; total: number;
  timeLeft: number; onRefreshQuote: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const expired = timeLeft <= 0;
  const amountStr = fmtCrypto(quote.payAmount, asset.decimals);
  const qrValue = `${network.scheme}:${network.wallet}?amount=${amountStr}`;

  const copy = useCallback((text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (expired) {
    return (
      <div className="animate-fade-in-up text-center py-8">
        <div className="w-20 h-20 rounded-full bg-destructive/10 mx-auto mb-6 flex items-center justify-center">
          <Clock className="w-9 h-9 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Quote expired</h3>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
          Rates move, so quotes are only held for a few minutes. Please do not send funds to the previous address.
        </p>
        <button onClick={onRefreshQuote} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Get new quote
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className={`flex items-center justify-center gap-2 mb-6 py-2.5 px-5 rounded-full mx-auto w-fit ${timeLeft < 120 ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"}`}>
        <Clock className="w-4 h-4" />
        <span className="font-mono text-base font-semibold">{fmtTime(timeLeft)}</span>
        <span className="text-xs">quote valid</span>
      </div>

      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-1">Send exactly</p>
        <p className="text-3xl font-bold font-mono">{amountStr} <span className="text-lg text-muted-foreground">{asset.symbol}</span></p>
        <p className="text-sm text-muted-foreground mt-1">via {network.label}</p>
        {config.fxEnabled && (
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            1 {asset.symbol} = {fmtMoney(quote.rate, config.settleCurrency)} · {fmtMoney(total, config.settleCurrency)}
          </p>
        )}
      </div>

      <div className="mx-auto w-48 h-48 rounded-2xl bg-white p-3 mb-6">
        <QRCodeSVG value={qrValue} size={168} level="M" bgColor="#ffffff" fgColor="#0b0e14" />
      </div>

      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Deposit address</label>
      <div onClick={() => copy(network.wallet)} className="flex items-center gap-2 bg-secondary rounded-xl p-4 mb-1 cursor-pointer hover:bg-muted transition-colors group">
        <span className="flex-1 font-mono text-sm break-all">{network.wallet}</span>
        {copied ? <Check className="w-4 h-4 text-success shrink-0" /> : <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />}
      </div>
      <p className="text-xs text-muted-foreground px-1 mb-6">{copied ? <span className="text-success">Copied!</span> : "Tap to copy"}</p>

      <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary/60 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        Waiting for your payment…
      </div>
    </div>
  );
};

export default PayStep;
