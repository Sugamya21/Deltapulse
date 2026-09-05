# DeltaPulse

## Smart Market Watchlist for Meaningful Market Changes

DeltaPulse is a smart, multi-asset market tracking platform designed to make market monitoring faster, clearer, and more personalized.

The platform allows users to discover market assets, create personalized watchlists, monitor portfolio holdings, and view the latest available market information. Its core feature is the ability to track how an asset has changed **since the user's last check**, rather than relying only on the standard 24-hour market movement.

---

## 🚀 Key Features

### 🔎 Explore & Discover

The Explore section provides a searchable market discovery experience where users can find assets across multiple categories.

Supported assets include:

- Stocks
- Cryptocurrencies
- Commodities
- Other supported market instruments

Each asset can be reviewed before being added to the Watchlist or Portfolio.

---

### ⭐ Smart Watchlist

The Watchlist is the central monitoring area of DeltaPulse.

For every tracked asset, the platform displays:

- Current market price
- Current daily change
- Change percentage
- Change since the last check
- Change classification
- Last checked information
- Attention status

The watchlist is personalized to the authenticated user and persists across sessions.

---

## ⏱️ Since Last Checked

DeltaPulse maintains a price baseline for each tracked asset.

When an asset is checked again, the latest market price is compared against the stored baseline.

```text
Change Since Last Check =
((Current Price - Last Checked Price) / Last Checked Price) × 100