

# Rebrand to Waltrex

## Summary
Replace all references to "Wally" and "Alter" as separate products with **Waltrex** as the unified brand powering the crypto checkout experience. The BoletaMX ticketing site remains unchanged as the fictitious client platform.

## Changes

### 1. CheckoutDrawer.tsx — Footer rebranding
- **Line 169**: Replace `Crypto payments by Wally · FX by Alter` with `Powered by waltrex` using the existing `text-gradient-green` style on the "waltrex" wordmark (lowercase, matching waltrex.io brand)

### 2. Knowledge / Memory update
- Update internal context: Waltrex = the unified product (wallet generation + FX conversion). "Wally" and "Alter" are internal codenames / modules, not user-facing brands.

## What stays the same
- BoletaMX branding (navbar, footer, event page) -- untouched
- All checkout flow logic, pricing, timer, crypto options -- untouched
- Color scheme and design system -- already aligned with Waltrex's dark + neon green identity

## What comes next (not part of this plan)
- Second demo: a fictitious broker platform where a user deposits crypto (e.g., USDT) and the platform credits USDT directly -- no FX conversion. Same Waltrex-powered checkout, different use case.

## Technical detail
Only one file changes: `src/components/CheckoutDrawer.tsx`, line 169. A single string replacement.

