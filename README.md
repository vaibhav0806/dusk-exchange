# Dusk Exchange

<div align="center">

```
  ██████╗ ██╗   ██╗███████╗██╗  ██╗
  ██╔══██╗██║   ██║██╔════╝██║ ██╔╝
  ██║  ██║██║   ██║███████╗█████╔╝
  ██║  ██║██║   ██║╚════██║██╔═██╗
  ██████╔╝╚██████╔╝███████║██║  ██╗
  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝
```

**Private Limit Order DEX on Solana**

*Trade without fear of MEV attacks*

[![Built with Arcium](https://img.shields.io/badge/Privacy-Arcium%20MPC-cyan)](https://arcium.com)
[![Solana](https://img.shields.io/badge/Blockchain-Solana-purple)](https://solana.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Demo](#demo) | [How It Works](#how-it-works) | [Quick Start](#quick-start) | [Architecture](#architecture)

</div>

---

## The Problem

MEV (Maximal Extractable Value) attacks cost DeFi users **over $1 billion annually**. When you place an order on a traditional DEX:

1. Your order details (price, amount) are **visible in the mempool**
2. Attackers see your trade before it executes
3. They **front-run** (buy before you) and **back-run** (sell after you)
4. You get a worse price, they pocket the difference

This is called a **sandwich attack**, and it affects ~12% of all DEX trades.

## The Solution

Dusk Exchange encrypts your order details using **Arcium MPC** (Multi-Party Computation). Attackers cannot see your order information, making sandwich attacks **impossible**.

```
┌─────────────────────────────────────────────────────────────────┐
│                         TRADITIONAL DEX                          │
├─────────────────────────────────────────────────────────────────┤
│  Your Order ──→ Mempool ──→ ATTACKER SEES EVERYTHING ──→ Rekt  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         DUSK EXCHANGE                            │
├─────────────────────────────────────────────────────────────────┤
│  Your Order ──→ ENCRYPTED ──→ Attacker sees ??? ──→ Fair Trade │
└─────────────────────────────────────────────────────────────────┘
```

## Demo

### Run the MEV Demo

See how Dusk Exchange protects against sandwich attacks:

```bash
# Shell demo (no dependencies)
./scripts/mev-demo.sh

# TypeScript demo
cd scripts && npm install && npm run demo
```

### Try the Frontend

```bash
cd app && npm install && npm run dev
# Open http://localhost:3000
```

### Video Demo

[Watch the 3-minute demo video](#) (coming soon)

## How It Works

### Order Flow

```
┌──────────┐     ┌────────────────┐     ┌─────────────────┐
│  User    │────→│  Dusk Client   │────→│  Solana Program │
│          │     │  (encrypts)    │     │                 │
└──────────┘     └────────────────┘     └────────┬────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────┐
                                        │   Arcium MPC    │
                                        │   (processes    │
                                        │    encrypted    │
                                        │    orderbook)   │
                                        └────────┬────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────┐
                                        │  Match Result   │
                                        │  (only matched  │
                                        │   trades are    │
                                        │   revealed)     │
                                        └─────────────────┘
```

### Encryption Details

1. **Key Exchange**: User derives shared secret with MXE (X25519)
2. **Cipher**: Order price/amount encrypted with Rescue cipher (MPC-friendly)
3. **Storage**: Encrypted data stored on-chain, unreadable to all
4. **Matching**: MPC nodes process encrypted orderbook without decryption
5. **Reveal**: Only matched trade execution price revealed post-facto

### What Attackers See

| Field | Traditional DEX | Dusk Exchange |
|-------|-----------------|---------------|
| Side (buy/sell) | `BUY` | `???` |
| Price | `$100.50` | `0x7f3a9b2c...` |
| Amount | `10 SOL` | `0x1b8df4a1...` |
| User | `Alice...` | `Alice...` |

**Result**: Attackers cannot determine if sandwich is profitable.

## Key Features

- **Private Orders**: Price and amount encrypted before submission
- **MEV Protection**: Attackers can't see order details to front-run
- **Fair Execution**: Orders matched at midpoint price
- **Non-Custodial**: Tokens stay in your control via PDAs
- **Low Latency**: Solana's speed + Arcium's efficient MPC

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (1.75+)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (1.18+)
- [Anchor](https://www.anchor-lang.com/docs/installation) (0.32.0)
- [Arcium CLI](https://docs.arcium.com/developers) (0.5.4+)
- Node.js (18+)

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/dusk-exchange
cd dusk-exchange

# Install dependencies
yarn install

# Build Solana program (requires platform-tools v1.52+)
cargo build-sbf --manifest-path programs/dusk_exchange/Cargo.toml --tools-version v1.52

# Build TypeScript SDK
cd client && npm install && npm run build

# Build frontend
cd ../app && npm install && npm run build
```

### Running Locally

```bash
# Terminal 1: Start local validator with required programs
solana-test-validator --reset \
  --bpf-program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS target/deploy/dusk_exchange.so \
  --bpf-program F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk artifacts/arcium_program_0.5.4.so \
  --bpf-program L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95 artifacts/lighthouse.so

# Terminal 2: Run tests
ANCHOR_PROVIDER_URL=http://127.0.0.1:8899 yarn test

# Terminal 3: Start frontend
cd app && npm run dev
```

### Deploying to Devnet

```bash
# Configure for devnet
solana config set --url devnet
solana airdrop 2

# Deploy program
anchor deploy --program-name dusk_exchange

# Initialize Arcium cluster (if using MPC)
arcium init-cluster --offset <8-digit-number> --max-nodes 4
```

## Architecture

### Project Structure

```
dusk-exchange/
├── programs/dusk_exchange/     # Anchor smart contract
│   └── src/
│       ├── lib.rs              # Program entry point
│       ├── state/              # Account definitions
│       │   ├── market.rs       # Market configuration
│       │   ├── user_position.rs # User deposits
│       │   └── settlement.rs   # Trade settlements
│       ├── instructions/       # Instruction handlers
│       │   ├── initialize_market.rs
│       │   ├── deposit.rs
│       │   ├── withdraw.rs
│       │   ├── place_order.rs  # Encrypted order
│       │   ├── cancel_order.rs
│       │   ├── match_orders.rs # Trigger MPC
│       │   └── settle_trade.rs
│       ├── errors.rs
│       └── events.rs
├── encrypted-ixs/              # Arcis MPC circuits
│   └── src/lib.rs              # add_order, remove_order, match_book
├── client/                     # TypeScript SDK
│   └── src/
│       ├── client.ts           # DuskExchangeClient
│       ├── encryption.ts       # Arcium encryption
│       └── types.ts            # TypeScript interfaces
├── app/                        # React frontend
│   └── src/
│       ├── components/         # UI components
│       └── app/                # Next.js pages
├── scripts/                    # Demo scripts
│   ├── mev-demo.sh             # Shell MEV demo
│   └── mev-demo.ts             # TypeScript MEV demo
└── tests/                      # Integration tests
```

### Accounts

| Account | Seeds | Description |
|---------|-------|-------------|
| `Market` | `["market", market_id]` | Trading pair config, vaults, fees |
| `UserPosition` | `["position", market, user]` | User deposits and locks |
| `TradeSettlement` | `["settlement", market, seq]` | Matched trade details |

### Instructions

| Instruction | Description | Arcium? |
|-------------|-------------|---------|
| `initialize_market` | Create new trading pair | No |
| `deposit` | Lock tokens for trading | No |
| `withdraw` | Withdraw available tokens | No |
| `place_order` | Submit encrypted limit order | Yes |
| `cancel_order` | Cancel pending order | Yes |
| `match_orders` | Trigger MPC matching | Yes |
| `settle_trade` | Execute matched trade | No |

### MPC Circuits (Arcis)

| Circuit | Input | Output |
|---------|-------|--------|
| `add_order` | Encrypted price, amount, side | Updated orderbook |
| `remove_order` | Order ID, owner | Success boolean |
| `match_book` | Encrypted orderbook | Match result (revealed) |

## SDK Usage

```typescript
import { DuskExchangeClient } from '@dusk-exchange/client';
import { Connection, Keypair } from '@solana/web3.js';

// Initialize client
const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate(); // or use wallet adapter
const client = new DuskExchangeClient(connection, wallet);

// Create market (admin only)
const { marketPda } = await client.createMarket({
  marketId: 1,
  baseMint: SOL_MINT,
  quoteMint: USDC_MINT,
  feeRateBps: 30, // 0.3%
});

// Deposit tokens
await client.deposit({
  market: marketPda,
  amount: 10_000_000_000n, // 10 SOL
  isBase: true,
});

// Place encrypted order (price hidden from attackers!)
const orderId = await client.placeOrder(marketPda, {
  price: 100_500_000n,    // $100.50 - ENCRYPTED
  amount: 1_000_000_000n, // 1 SOL - ENCRYPTED
  side: 'buy',
});

// Match orders (permissionless)
const result = await client.matchOrders(marketPda);

// Settle matched trades
if (result.matched) {
  await client.settleTrade(result.settlementPda);
}
```

## Security

### Encryption

- **Key Exchange**: X25519 ECDH with MXE public key
- **Cipher**: Rescue (algebraic hash, MPC-friendly)
- **Nonce**: 16-byte random, prevents replay attacks

### Access Control

- Market authority: Can pause markets, update fees
- Order owner: Can cancel their own orders
- Settlement: PDA-signed, cannot be spoofed

### Protections

- Self-trade prevention (same owner can't match)
- Balance checks on all transfers
- Overflow protection on arithmetic

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Blockchain | Solana | High throughput, low fees |
| Smart Contract | Anchor (Rust) | Type-safe on-chain logic |
| Privacy | Arcium MPC | Encrypted computation |
| Cipher | Rescue | MPC-friendly encryption |
| SDK | TypeScript | Frontend integration |
| Frontend | Next.js + Tailwind | Trading interface |

## Roadmap

- [x] Core Anchor program (Phase 1)
- [x] Arcium MPC circuits (Phase 2)
- [x] TypeScript SDK (Phase 4)
- [x] React frontend (Phase 5)
- [x] MEV demo script (Phase 6)
- [ ] Full Arcium testnet deployment
- [ ] Demo video
- [ ] Mainnet deployment

## Hackathon

Built for the [Solana Privacy Hackathon](https://solana.com/privacyhack) (Jan 12 - Feb 1, 2026)

**Target Bounty**: Arcium $10,000 "End-to-End Private DeFi"

## Resources

- [Arcium Documentation](https://docs.arcium.com)
- [Arcium Testnet Guide](https://www.arcium.com/articles/arcium-public-testnet-launch-guide)
- [Anchor Book](https://www.anchor-lang.com/docs)
- [Solana Cookbook](https://solanacookbook.com)

## License

MIT

## Acknowledgments

- [Arcium](https://arcium.com) for MPC infrastructure
- [Solana Foundation](https://solana.com) for hosting the hackathon

---

<div align="center">

**Dusk Exchange** - Trade Without Fear

</div>
