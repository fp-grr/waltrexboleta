import type { ReactNode } from "react";
import { Check } from "lucide-react";
import type { Settlement, WaltrexCheckoutConfig } from "./types";
import { fmtCrypto, fmtLocal, fmtLocalRate, fmtMoney, fmtUsd, shortHash } from "./format";
import { getAsset } from "./rates";
import { IndicativeTag } from "./IndicativeTag";

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex justify-between gap-4"><span className="text-muted-foreground">{label}</span><span className="text-right">{children}</span></div>
);

const Frame = ({ config, onClose, children }: { config: WaltrexCheckoutConfig; onClose: () => void; children: ReactNode }) => (
  <div className="animate-fade-in-up text-center py-6">
    <div className="w-20 h-20 rounded-full bg-primary mx-auto mb-6 flex items-center justify-center glow-green-strong">
      <Check className="w-10 h-10 text-primary-foreground" />
    </div>
    <h2 className="text-2xl font-bold mb-2">{config.successCopy.title}</h2>
    <p className="text-sm text-muted-foreground mb-8">{config.successCopy.subtitle}</p>

    <div className="bg-secondary rounded-xl p-5 mb-6 space-y-3 text-left text-sm [&>*:not(:last-child)]:pb-3 [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-border">
      {children}
    </div>

    <button onClick={onClose} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
      {config.successCopy.cta}
    </button>
  </div>
);

const CompleteStep = ({ config, settlement: s, onClose }: {
  config: WaltrexCheckoutConfig; settlement: Settlement; onClose: () => void;
}) => {
  if (s.method === "bank") {
    return (
      <Frame config={config} onClose={onClose}>
        <Row label="Sent"><span className="font-mono font-medium">{fmtLocal(s.sent, s.currency)}</span></Row>
        <Row label="Rate"><span className="font-mono text-xs">{fmtLocalRate(s.rate, s.currency)}</span><IndicativeTag source={s.source} /></Row>
        <Row label="Credited"><span className="font-mono font-semibold text-success">{fmtUsd(s.received)}</span></Row>
        <Row label="Reference"><span className="font-mono text-xs text-muted-foreground">{s.reference}</span></Row>
        <Row label="Order"><span className="font-mono text-xs text-muted-foreground">{s.orderId}</span></Row>
      </Frame>
    );
  }

  const asset = getAsset(s.asset);
  return (
    <Frame config={config} onClose={onClose}>
      <Row label="You paid">
        <span className="font-mono font-medium">{fmtCrypto(s.paidAmount, asset.decimals)} {s.asset}</span>
        <span className="block text-xs text-muted-foreground">{s.networkLabel}</span>
      </Row>
      {s.fxEnabled && <Row label="Rate"><span className="font-mono text-xs">1 {s.asset} = {fmtMoney(s.rate, s.settleCurrency)}</span></Row>}
      <Row label="Amount"><span className="font-mono">{fmtMoney(s.amount, s.settleCurrency)}</span></Row>
      {s.fee > 0 && <Row label="Fee"><span className="font-mono">{fmtMoney(s.fee, s.settleCurrency)}</span></Row>}
      <Row label={`${config.merchantName} received`}><span className="font-mono font-semibold text-success">{fmtMoney(s.received, s.settleCurrency)}</span></Row>
      <Row label="Order"><span className="font-mono text-xs text-muted-foreground">{s.orderId}</span></Row>
      <Row label="TX hash"><span className="font-mono text-xs text-muted-foreground">{shortHash(s.txHash)}</span></Row>
    </Frame>
  );
};

export default CompleteStep;
