import type { SettleCurrency } from "./rates";
import type { LocalCurrency } from "@/config/rates";

export const fmtMoney = (n: number, cur: SettleCurrency) => {
  const s = n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
  return cur === "USDT" ? `${s} USDT` : `$${s} ${cur}`;
};

const fmtNum = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const fmtLocal = (n: number, cur: LocalCurrency) => `${fmtNum(n, 0)} ${cur}`;
export const fmtUsd = (n: number) => `$${fmtNum(n, 2)} USD`;
export const fmtLocalRate = (rate: number, cur: LocalCurrency) => `1 USD = ${fmtNum(rate, cur === "MXN" ? 2 : 0)} ${cur}`;

export const fmtCrypto = (n: number, decimals: number) => n.toFixed(decimals);

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

export const round2 = (n: number) => Math.round(n * 100) / 100;

export const shortHash = (h: string) => `${h.slice(0, 6)}…${h.slice(-4)}`;

export const randomHex = (len: number) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");
