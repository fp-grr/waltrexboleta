import type { AssetSymbol, SettleCurrency } from "./rates";
import type { LocalCurrency, RateSource } from "@/config/rates";

export interface WaltrexCheckoutConfig {
  merchantName: string;
  settleCurrency: SettleCurrency;
  /** Fee as a fraction of the amount, e.g. 0.08 = 8% (charged on top) */
  feePct: number;
  successCopy: { title: string; subtitle: string; cta: string };
  /** true: any asset is converted at the quoted rate. false: 1:1, settle-currency asset only. */
  fxEnabled: boolean;
  amountMode: "fixed" | "user-input";
  /** Adds "Local bank transfer" (local currency -> USD at mid-market) as the first method. */
  bankTransfer?: { currencies: LocalCurrency[]; fxEnabled: boolean };
}

interface BaseSettlement {
  settleCurrency: SettleCurrency;
  /** what the merchant / account ends up with */
  received: number;
  orderId: string;
}

export interface CryptoSettlement extends BaseSettlement {
  method: "crypto";
  asset: AssetSymbol;
  networkLabel: string;
  paidAmount: number;
  rate: number;
  amount: number;
  fee: number;
  fxEnabled: boolean;
  txHash: string;
}

export interface BankSettlement extends BaseSettlement {
  method: "bank";
  currency: LocalCurrency;
  sent: number;
  rate: number;
  source: RateSource;
}

export type Settlement = CryptoSettlement | BankSettlement;

export interface Quote {
  rate: number;
  payAmount: number;
  issuedAt: number;
  id: number;
}

export type CheckoutStep =
  | "amount" | "method" | "asset" | "pay" | "detecting" | "complete"
  | "currency" | "bank-amount" | "bank-details" | "bank-confirming";
