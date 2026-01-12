# Dusk Exchange - Hackathon Submission

## Solana Privacy Hackathon (Jan 12 - Feb 1, 2026)

---

## Project Information

| Field | Value |
|-------|-------|
| **Project Name** | Dusk Exchange |
| **Tagline** | Private Limit Order DEX - Trade Without Fear |
| **Category** | DeFi / Privacy |
| **Target Bounty** | Arcium $10,000 "End-to-End Private DeFi" |

---

## Links

| Resource | URL |
|----------|-----|
| **GitHub Repository** | https://github.com/your-username/dusk-exchange |
| **Demo Video** | [Coming Soon - Max 3 minutes] |
| **Live Demo (Frontend)** | Run locally: `cd app && npm run dev` |
| **Deployed Program (Devnet)** | `7LyfNf3Q7weRFCA316BepiMGWkKVY5aE4xYPrNzSFTRQ` |
| **Solana Explorer** | [View on Explorer](https://explorer.solana.com/address/7LyfNf3Q7weRFCA316BepiMGWkKVY5aE4xYPrNzSFTRQ?cluster=devnet) |

---

## Problem Statement

MEV (Maximal Extractable Value) attacks extract **over $1 billion annually** from DeFi users. The most common attack is the **sandwich attack**:

1. User submits an order on a DEX
2. Attacker sees the order in the mempool
3. Attacker front-runs (buys before user)
4. User's order executes at a worse price
5. Attacker back-runs (sells after user)
6. Attacker profits, user loses

**Impact:**
- ~12% of all DEX trades affected
- Average loss: $28 per affected transaction
- Disproportionately affects retail traders

---

## Solution

Dusk Exchange uses **Arcium MPC** (Multi-Party Computation) to encrypt order details before they reach the blockchain. Attackers cannot see:

- Order side (buy/sell)
- Order price
- Order amount

Without this information, sandwich attacks are **impossible**.

### How It Works

```
1. User encrypts order client-side (X25519 + Rescue cipher)
2. Encrypted order sent to Solana program
3. Arcium MPC processes encrypted orderbook
4. Only matched trades are revealed (post-execution)
5. Settlement occurs on-chain
```

### Key Innovation

We're the first to apply **encrypted orderbooks** to a limit order DEX on Solana. Previous privacy solutions focused on:
- Dark pools (trust required)
- Commit-reveal schemes (timing attacks possible)
- Off-chain matching (centralization risk)

Dusk Exchange provides **trustless, on-chain privacy** with no timing vulnerabilities.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Blockchain | Solana (Devnet) |
| Smart Contract | Anchor (Rust) |
| Privacy Layer | Arcium MPC |
| Encryption | X25519 ECDH + Rescue Cipher |
| SDK | TypeScript |
| Frontend | Next.js + Tailwind CSS |

---

## Features Implemented

### Core Protocol
- [x] Market creation with configurable fees
- [x] Deposit/withdraw tokens
- [x] Encrypted order placement
- [x] Order cancellation
- [x] MPC-based order matching
- [x] Trade settlement

### Arcium Integration
- [x] `add_order` circuit - Insert encrypted orders
- [x] `remove_order` circuit - Cancel orders by ID
- [x] `match_book` circuit - Find and reveal matches

### Client SDK
- [x] DuskExchangeClient class
- [x] Order encryption utilities
- [x] Account fetching
- [x] Transaction builders

### Frontend
- [x] Wallet connection (Phantom/Solflare)
- [x] Order form with encryption indicator
- [x] Order book display
- [x] Open orders management
- [x] Trade history
- [x] Deposit/withdraw modal

### Demo
- [x] MEV attack simulation script
- [x] Side-by-side comparison (traditional vs Dusk)

---

## Usage

### Quick Start

```bash
# Clone and build
git clone https://github.com/your-username/dusk-exchange
cd dusk-exchange
yarn install

# Build program
cargo build-sbf --manifest-path programs/dusk_exchange/Cargo.toml --tools-version v1.52

# Run MEV demo
./scripts/mev-demo.sh

# Start frontend
cd app && npm run dev
```

### Place an Encrypted Order

```typescript
import { DuskExchangeClient } from '@dusk-exchange/client';

const client = new DuskExchangeClient(connection, wallet);

// Order details are encrypted before sending
const orderId = await client.placeOrder(market, {
  price: 100_500_000n,    // $100.50 - ENCRYPTED
  amount: 1_000_000_000n, // 1 SOL - ENCRYPTED
  side: 'buy',
});
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ Order Form  │───>│  Encrypt    │───>│   Sign TX   │  │
│  │             │    │  (Rescue)   │    │  (Wallet)   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    SOLANA NETWORK                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │              DUSK EXCHANGE PROGRAM               │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │    │
│  │  │ Market  │  │ User    │  │ Queue MPC       │  │    │
│  │  │ State   │  │ Position│  │ Computation     │  │    │
│  │  └─────────┘  └─────────┘  └────────┬────────┘  │    │
│  └─────────────────────────────────────┼───────────┘    │
└─────────────────────────────────────────┼───────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────┐
│                    ARCIUM MPC NETWORK                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ Node 1  │  │ Node 2  │  │ Node 3  │  │ Node 4  │    │
│  │ (Share) │  │ (Share) │  │ (Share) │  │ (Share) │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
│       └────────────┴────────────┴────────────┘          │
│                         │                                │
│              Process Encrypted Orderbook                 │
│                         │                                │
│                         ▼                                │
│            ┌─────────────────────────┐                  │
│            │ Reveal: Match Result    │                  │
│            │ (price, amount, parties)│                  │
│            └─────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

---

## Security Considerations

### Encryption

- **Key Exchange**: X25519 ECDH with MXE public key
- **Cipher**: Rescue (MPC-friendly algebraic hash)
- **Nonce**: 16-byte random, unique per order

### Attack Prevention

| Attack | Mitigation |
|--------|------------|
| Sandwich | Order details encrypted |
| Front-running | Can't see order direction/price |
| Replay | Unique nonce per order |
| Self-trade | Owner check in matching |

### Limitations

- Arcium testnet availability
- MPC latency (~1-2 blocks)
- Limited orderbook size (64 orders per side)

---

## Team

| Name | Role | Contact |
|------|------|---------|
| [Your Name] | Full Stack Developer | [Email/Twitter] |

---

## Acknowledgments

- **Arcium** - MPC infrastructure and support
- **Solana Foundation** - Hackathon hosting
- **Anchor** - Framework for Solana development

---

## Future Roadmap

1. **Mainnet Deployment** - After security audit
2. **More Trading Pairs** - ETH, BTC, stablecoins
3. **Partial Fills** - Improve capital efficiency
4. **Maker/Taker Fees** - Incentivize liquidity
5. **Mobile App** - React Native client

---

## Bounty Alignment

### Arcium "$10,000 - End-to-End Private DeFi"

**Requirements Met:**
- [x] Built on Solana
- [x] Uses Arcium MPC for privacy
- [x] End-to-end encrypted trading flow
- [x] Functional DEX with limit orders
- [x] MEV protection demonstration

**Innovation:**
- First encrypted limit order book on Solana
- Full matching logic in MPC circuits
- Production-ready SDK and frontend

---

## Submission Checklist

- [x] GitHub repository (public)
- [x] README with setup instructions
- [x] Deployed to Solana devnet
- [x] TypeScript SDK
- [x] React frontend
- [x] MEV demo script
- [ ] Demo video (max 3 minutes)
- [ ] Submission form completed

---

*Built with privacy in mind for the Solana Privacy Hackathon 2026*
