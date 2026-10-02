import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/* ─── Account (mock) ─── */

interface AccountCtx {
  balance: number;
  deposit: (amount: number) => void;
}

const AccountContext = createContext<AccountCtx | null>(null);

export const BrokerAccountProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState(12_450);
  const deposit = useCallback((amount: number) => setBalance((b) => Math.round((b + amount) * 100) / 100), []);
  const value = useMemo(() => ({ balance, deposit }), [balance, deposit]);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useBrokerAccount = () => {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useBrokerAccount must be used inside BrokerAccountProvider");
  return ctx;
};

/* ─── Market (simulated random walk) ─── */

export interface Instrument {
  symbol: string;
  name: string;
  start: number;
  decimals: number;
  /** per-tick volatility as a fraction */
  vol: number;
}

export const INSTRUMENTS: Instrument[] = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", start: 1.0842, decimals: 5, vol: 0.00012 },
  { symbol: "GBP/USD", name: "Pound / US Dollar", start: 1.2715, decimals: 5, vol: 0.00014 },
  { symbol: "XAU/USD", name: "Gold", start: 2648.4, decimals: 2, vol: 0.0003 },
  { symbol: "BTC/USD", name: "Bitcoin", start: 98_500, decimals: 2, vol: 0.0007 },
  { symbol: "NAS100", name: "Nasdaq 100", start: 20_940, decimals: 1, vol: 0.0004 },
  { symbol: "TSLA", name: "Tesla Inc.", start: 342.18, decimals: 2, vol: 0.0006 },
];

export interface Position {
  id: number;
  symbol: string;
  side: "BUY" | "SELL";
  size: number;
  entry: number;
}

export const POSITIONS: Position[] = [
  { id: 1, symbol: "EUR/USD", side: "BUY", size: 50_000, entry: 1.0821 },
  { id: 2, symbol: "XAU/USD", side: "BUY", size: 2, entry: 2631.2 },
  { id: 3, symbol: "BTC/USD", side: "SELL", size: 0.15, entry: 99_200 },
  { id: 4, symbol: "TSLA", side: "BUY", size: 20, entry: 338.5 },
];

const HISTORY = 60;

const seedHistory = (i: Instrument) => {
  const pts: number[] = [];
  let p = i.start;
  for (let n = 0; n < HISTORY; n++) {
    p *= 1 + (Math.random() - 0.5) * 2 * i.vol;
    pts.push(p);
  }
  return pts;
};

export const useMarket = () => {
  const [history, setHistory] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(INSTRUMENTS.map((i) => [i.symbol, seedHistory(i)])),
  );
  const open = useRef<Record<string, number>>(Object.fromEntries(INSTRUMENTS.map((i) => [i.symbol, i.start])));

  useEffect(() => {
    const t = setInterval(() => {
      setHistory((h) => {
        const next: Record<string, number[]> = {};
        for (const i of INSTRUMENTS) {
          const arr = h[i.symbol];
          const last = arr[arr.length - 1];
          next[i.symbol] = [...arr.slice(1), last * (1 + (Math.random() - 0.5) * 2 * i.vol)];
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const price = (symbol: string) => history[symbol][history[symbol].length - 1];
  const changePct = (symbol: string) => ((price(symbol) - open.current[symbol]) / open.current[symbol]) * 100;
  return { history, price, changePct };
};

export const positionPnl = (p: Position, current: number) =>
  (current - p.entry) * p.size * (p.side === "BUY" ? 1 : -1);
