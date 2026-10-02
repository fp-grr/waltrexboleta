import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownToLine, TrendingUp } from "lucide-react";
import SiteSwitcher from "@/components/SiteSwitcher";
import { WaltrexCheckout, type WaltrexCheckoutConfig } from "@/components/waltrex";
import { INSTRUMENTS, POSITIONS, positionPnl, useBrokerAccount, useMarket } from "@/lib/broker";

const DEPOSIT_CONFIG: WaltrexCheckoutConfig = {
  merchantName: "TopBroker",
  settleCurrency: "USDT",
  feePct: 0,
  fxEnabled: false,
  amountMode: "user-input",
  bankTransfer: { currencies: ["MXN", "COP"], fxEnabled: true },
  successCopy: { title: "Deposit received", subtitle: "Your funds have been credited to your trading account", cta: "Back to trading" },
};

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const signed = (n: number) => `${n >= 0 ? "+" : "−"}${usd(Math.abs(n))}`;
const tone = (n: number) => (n >= 0 ? "text-success" : "text-destructive");

const BrokerPage = () => {
  const { balance, deposit } = useBrokerAccount();
  const { history, price, changePct } = useMarket();
  const [selected, setSelected] = useState(INSTRUMENTS[0]);
  const [depositOpen, setDepositOpen] = useState(false);

  const dec = (symbol: string) => INSTRUMENTS.find((i) => i.symbol === symbol)!.decimals;
  const floating = POSITIONS.reduce((sum, p) => sum + positionPnl(p, price(p.symbol)), 0);
  const equity = balance + floating;

  const series = history[selected.symbol].map((v, i) => ({ t: i, v }));
  const lo = Math.min(...series.map((s) => s.v));
  const hi = Math.max(...series.map((s) => s.v));
  const pad = (hi - lo) * 0.2 || 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline">top<span className="text-gradient-green">broker</span></span>
          </div>
          <SiteSwitcher />
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-6 text-right">
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</p><p className="font-mono text-sm font-semibold">{usd(balance)}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Equity</p><p className="font-mono text-sm font-semibold text-primary">{usd(equity)}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Floating P&L</p><p className={`font-mono text-sm font-semibold ${tone(floating)}`}>{signed(floating)}</p></div>
          </div>
          <button onClick={() => setDepositOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity glow-green">
            <ArrowDownToLine className="w-4 h-4" /> Deposit
          </button>
        </div>
        <div className="md:hidden flex justify-around py-2 border-t border-border text-center">
          <div><p className="text-[10px] uppercase text-muted-foreground">Balance</p><p className="font-mono text-xs font-semibold">{usd(balance)}</p></div>
          <div><p className="text-[10px] uppercase text-muted-foreground">Equity</p><p className="font-mono text-xs font-semibold text-primary">{usd(equity)}</p></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market watch */}
        <section className="rounded-2xl bg-card border border-border overflow-hidden lg:order-1">
          <h2 className="px-5 py-4 text-sm font-semibold border-b border-border">Market watch</h2>
          <ul>
            {INSTRUMENTS.map((i) => {
              const ch = changePct(i.symbol);
              const active = i.symbol === selected.symbol;
              return (
                <li key={i.symbol}>
                  <button onClick={() => setSelected(i)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors border-l-2 ${active ? "bg-secondary border-primary" : "border-transparent hover:bg-secondary/50"}`}>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium">{i.symbol}</p><p className="text-xs text-muted-foreground truncate">{i.name}</p></div>
                    <div className="text-right"><p className="font-mono text-sm">{price(i.symbol).toFixed(i.decimals)}</p><p className={`font-mono text-xs ${tone(ch)}`}>{ch >= 0 ? "+" : ""}{ch.toFixed(2)}%</p></div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Chart */}
        <section className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 lg:order-2">
          <div className="flex items-end justify-between mb-4">
            <div><h2 className="text-lg font-semibold">{selected.symbol}</h2><p className="text-xs text-muted-foreground">{selected.name} · live (simulated)</p></div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold">{price(selected.symbol).toFixed(selected.decimals)}</p>
              <p className={`font-mono text-xs ${tone(changePct(selected.symbol))}`}>{changePct(selected.symbol) >= 0 ? "+" : ""}{changePct(selected.symbol).toFixed(2)}%</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="neon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(145 80% 50%)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(145 80% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis domain={[lo - pad, hi + pad]} orientation="right" width={64} tickLine={false} axisLine={false}
                  tick={{ fill: "hsl(220 10% 55%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
                  tickFormatter={(v: number) => v.toFixed(selected.decimals)} />
                <Tooltip
                  contentStyle={{ background: "hsl(220 18% 10%)", border: "1px solid hsl(220 15% 18%)", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={() => ""} formatter={(v: number) => [v.toFixed(selected.decimals), "Price"]} />
                <Area type="monotone" dataKey="v" stroke="hsl(145 80% 50%)" strokeWidth={2} fill="url(#neon)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Positions */}
        <section className="lg:col-span-3 rounded-2xl bg-card border border-border overflow-hidden lg:order-3">
          <h2 className="px-5 py-4 text-sm font-semibold border-b border-border">Open positions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  {["Symbol", "Side", "Size", "Entry", "Current", "P&L"].map((h, k) => (
                    <th key={h} className={`px-5 py-3 font-medium ${k > 1 ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {POSITIONS.map((p) => {
                  const cur = price(p.symbol);
                  const pnl = positionPnl(p, cur);
                  return (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-5 py-3 font-sans font-medium">{p.symbol}</td>
                      <td className={`px-5 py-3 font-sans text-xs font-semibold ${p.side === "BUY" ? "text-success" : "text-destructive"}`}>{p.side}</td>
                      <td className="px-5 py-3 text-right">{p.size.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">{p.entry.toFixed(dec(p.symbol))}</td>
                      <td className="px-5 py-3 text-right">{cur.toFixed(dec(p.symbol))}</td>
                      <td className={`px-5 py-3 text-right font-semibold ${tone(pnl)}`}>{signed(pnl)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <WaltrexCheckout
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        config={DEPOSIT_CONFIG}
        summaryLabel="TopBroker deposit"
        onComplete={(s) => deposit(s.received)}
      />
    </div>
  );
};

export default BrokerPage;
