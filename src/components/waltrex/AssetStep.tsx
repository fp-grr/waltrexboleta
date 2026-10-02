import { ArrowRight } from "lucide-react";
import type { Asset, Network } from "./rates";
import { rateFor } from "./rates";
import { fmtCrypto, fmtMoney } from "./format";
import type { WaltrexCheckoutConfig } from "./types";

const AssetStep = ({ config, assets, total, asset, network, onAsset, onNetwork, onProceed }: {
  config: WaltrexCheckoutConfig; assets: Asset[]; total: number;
  asset: Asset; network: Network;
  onAsset: (a: Asset) => void; onNetwork: (n: Network) => void; onProceed: () => void;
}) => (
  <div className="animate-fade-in-up">
    <p className="text-sm text-muted-foreground mb-5">
      Select cryptocurrency to pay <span className="text-foreground font-medium">{fmtMoney(total, config.settleCurrency)}</span>
    </p>

    <div className="space-y-2 mb-6">
      {assets.map((a) => {
        const amt = total / rateFor(a, config.settleCurrency);
        const sel = a.symbol === asset.symbol;
        return (
          <button key={a.symbol} onClick={() => onAsset(a)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${sel ? "border-primary glow-green bg-secondary" : "border-border bg-secondary hover:border-border/80"}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: `hsl(${a.color} / 0.15)`, color: `hsl(${a.color})` }}>{a.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{a.symbol}</p>
              <p className="text-xs text-muted-foreground">{a.name} · {a.networks.length} network{a.networks.length > 1 ? "s" : ""}</p>
            </div>
            <span className="font-mono text-sm font-medium">{fmtCrypto(amt, a.decimals)}</span>
          </button>
        );
      })}
    </div>

    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Network</p>
    <div className="flex flex-wrap gap-2 mb-2">
      {asset.networks.map((n) => (
        <button key={n.id} onClick={() => onNetwork(n)}
          className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition-all ${n.id === network.id ? "border-primary bg-secondary text-primary" : "border-border bg-secondary text-muted-foreground hover:text-foreground"}`}>
          {n.label}
        </button>
      ))}
    </div>
    <p className="text-xs text-muted-foreground mb-6 px-1">Sending on the wrong network will result in lost funds.</p>

    <button onClick={onProceed} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
      Pay with {asset.symbol} <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

export default AssetStep;
