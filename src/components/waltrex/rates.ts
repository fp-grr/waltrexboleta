/**
 * Single source of truth for assets, networks, wallets and (mock) rates.
 * Swap this file for a live feed later; nothing else hardcodes a rate.
 */

import { FALLBACK_RATES } from "@/lib/rates";

export type AssetSymbol = "USDT" | "USDC" | "BTC" | "ETH" | "SOL";
export type SettleCurrency = "MXN" | "USD" | "USDT";

export interface Network {
  id: string;
  label: string;
  /** URI scheme used in the QR payload */
  scheme: string;
  wallet: string;
  /** confirmations shown in the auto-detect step */
  confirmations: number;
}

export interface Asset {
  symbol: AssetSymbol;
  name: string;
  icon: string;
  color: string; // hsl triplet
  decimals: number;
  /** USD price of 1 unit (mock) */
  usdPrice: number;
  networks: Network[];
}

export const ASSETS: Asset[] = [
  {
    symbol: "USDT", name: "Tether", icon: "₮", color: "168 70% 45%", decimals: 2, usdPrice: 1,
    networks: [
      { id: "trc20", label: "TRC-20 (Tron)", scheme: "tron", wallet: "TXqH7sVnEi4bK2uPfJ8mNzR3dWcYa6gLQ9", confirmations: 19 },
      { id: "erc20", label: "ERC-20 (Ethereum)", scheme: "ethereum", wallet: "0x8a2Ed9c41F7b28eAf4C7d91bA03e7912c5d04B3a", confirmations: 12 },
      { id: "polygon", label: "Polygon", scheme: "ethereum", wallet: "0x3Fb91c07aD42e5e1B8d6C0a97E24f5a1d8c6E720", confirmations: 128 },
    ],
  },
  {
    symbol: "USDC", name: "USD Coin", icon: "◎", color: "220 70% 55%", decimals: 2, usdPrice: 1,
    networks: [
      { id: "erc20", label: "ERC-20 (Ethereum)", scheme: "ethereum", wallet: "0x71C5d0e8A93b4F2e6D1a8B7c05E3f9a24d6B8c10", confirmations: 12 },
      { id: "polygon", label: "Polygon", scheme: "ethereum", wallet: "0x9dE2a4B6c18F03a7e5D9b2C4f6A81e03b7D5c2F9", confirmations: 128 },
      { id: "solana", label: "Solana", scheme: "solana", wallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", confirmations: 32 },
    ],
  },
  {
    symbol: "BTC", name: "Bitcoin", icon: "₿", color: "33 90% 55%", decimals: 6, usdPrice: 98_500,
    networks: [
      { id: "onchain", label: "Bitcoin (on-chain)", scheme: "bitcoin", wallet: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", confirmations: 2 },
      { id: "lightning", label: "Lightning", scheme: "lightning", wallet: "lnbc1062n1pjk4wm2qzv4w9xk3r7p5hq8u2n0d4s6a9", confirmations: 1 },
    ],
  },
  {
    symbol: "ETH", name: "Ethereum", icon: "Ξ", color: "250 60% 65%", decimals: 5, usdPrice: 3_400,
    networks: [
      { id: "mainnet", label: "Ethereum", scheme: "ethereum", wallet: "0xA4c1e7F90b3D2586e1aC7d0F4B92e8365a1D7c3E", confirmations: 12 },
      { id: "arbitrum", label: "Arbitrum One", scheme: "ethereum", wallet: "0xB7d3F2a081C94e56dA0b7E1c3F85a29D4e6C1b08", confirmations: 20 },
    ],
  },
  {
    symbol: "SOL", name: "Solana", icon: "◐", color: "290 70% 60%", decimals: 4, usdPrice: 210,
    networks: [
      { id: "solana", label: "Solana", scheme: "solana", wallet: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", confirmations: 32 },
    ],
  },
];

/** Units of fiat per 1 USD. */
export const FIAT_PER_USD: Record<"MXN" | "USD", number> = {
  MXN: FALLBACK_RATES.MXN,
  USD: 1,
};

/** Max quote drift applied when a quote is refreshed (mock market movement). */
export const QUOTE_DRIFT = 0.0015;
/** Quote validity in seconds. */
export const QUOTE_TTL_SECONDS = 600;
/** Simulated time until the payment "arrives" on-chain, in ms [min, max]. */
export const DETECT_DELAY_MS: [number, number] = [6000, 10000];

export const getAsset = (symbol: AssetSymbol) => ASSETS.find((a) => a.symbol === symbol)!;

/**
 * Settle-currency units per 1 unit of asset.
 * When settle is USDT (no FX), only USDT is 1:1; everything else is excluded upstream.
 */
export const rateFor = (asset: Asset, settle: SettleCurrency, drift = 0): number => {
  if (settle === "USDT") return asset.symbol === "USDT" ? 1 : NaN;
  return asset.usdPrice * FIAT_PER_USD[settle] * (1 + drift);
};
