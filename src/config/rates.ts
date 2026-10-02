/**
 * Bank-transfer quoting. Rates come from src/lib/rates.ts (live, with fallback).
 * Mid-market only: no spread, no fee.
 */
import { FALLBACK_RATES, getCachedRates, type LocalCurrency, type RateSnapshot, type RateSource } from "@/lib/rates";

export type { LocalCurrency, RateSource };

/** Smallest transfer accepted, in local currency (roughly 10-12 USD). */
export const MIN_LOCAL_AMOUNT: Record<LocalCurrency, number> = {
  MXN: 200,
  COP: 50_000,
};

/** How long a bank-transfer quote stays locked. */
export const BANK_QUOTE_TTL_SECONDS = 600;

export interface BankQuote {
  rate: number;
  usdCredited: number;
  expiresAt: number;
  source: RateSource;
}

export const usdFor = (localAmount: number, rate: number) => Math.round((localAmount / rate) * 100) / 100;

/** Reads the cached rate (never fetches). Pass a snapshot to price against a specific one. */
export const quote = (localAmount: number, currency: LocalCurrency, snapshot?: RateSnapshot | null): BankQuote => {
  const snap = snapshot ?? getCachedRates();
  const rate = snap ? snap.rates[currency] : FALLBACK_RATES[currency];
  return {
    rate,
    usdCredited: usdFor(localAmount, rate),
    expiresAt: Date.now() + BANK_QUOTE_TTL_SECONDS * 1000,
    source: snap ? snap.source : "fallback",
  };
};
