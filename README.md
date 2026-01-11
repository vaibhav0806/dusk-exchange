# Dusk Exchange

**Private Limit Order DEX on Solana using Arcium MPC**

Built for the [Solana Privacy Hackathon](https://solana.com/privacyhack) (Jan 12 - Feb 1, 2026)

## Overview

Dusk Exchange is a decentralized exchange that uses Multi-Party Computation (MPC) via [Arcium](https://arcium.com) to keep order details private until execution. This prevents MEV attacks like sandwich attacks and front-running.

### How It Works

```
User submits order → Encrypt with Arcium → Store in encrypted orderbook
                                                      ↓
                              Arcium MPC matches orders privately
                                                      ↓
                    Only matched trades revealed → Execute on Solana
```

### Key Features

- **Private Orders**: Price and amount encrypted before submission
- **MEV Protection**: Attackers can't see order details to front-run
- **Fair Execution**: Orders matched at midpoint price
- **Non-Custodial**: Tokens stay in your control via PDAs

## Project Structure

```
dusk-exchange/
├── programs/dusk_exchange/     # Anchor smart contract
│   └── src/
│       ├── lib.rs              # Program entry point
│       ├── state/              # Account definitions
│       ├── instructions/       # Instruction handlers
│       ├── errors.rs           # Error types
│       └── events.rs           # Event definitions
├── encrypted-ixs/              # Arcis MPC circuits
│   └── src/lib.rs              # Encrypted functions
├── client/                     # TypeScript SDK (TODO)
├── app/                        # React frontend (TODO)
├── tests/                      # Integration tests
├── Anchor.toml                 # Anchor configuration
├── Arcium.toml                 # Arcium configuration
└── Cargo.toml                  # Workspace configuration
```

## Prerequisites

- [Rust](https://rustup.rs/) (1.70+)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (1.18+)
- [Anchor](https://www.anchor-lang.com/docs/installation) (0.30.1)
- [Arcium CLI](https://docs.arcium.com/developers) (0.5.4)
- Node.js (18+)

## Setup

1. **Clone and install dependencies**
   ```bash
   cd dusk-exchange
   yarn install
   ```

2. **Build the program**
   ```bash
   anchor build
   ```

3. **Configure Solana for devnet**
   ```bash
   solana config set --url devnet
   solana-keygen new  # if you don't have a wallet
   solana airdrop 2   # get devnet SOL
   ```

4. **Deploy to devnet**
   ```bash
   anchor deploy
   ```

## Testing

Run local tests (without Arcium):
```bash
anchor test
```

Run with Arcium testnet:
```bash
arcium test
```

## Architecture

### Accounts

| Account | Description |
|---------|-------------|
| `Market` | Trading pair config (base/quote mints, vaults, fees) |
| `UserPosition` | User's deposits and locked amounts per market |
| `TradeSettlement` | Matched trade details for settlement |

### Instructions

| Instruction | Description |
|-------------|-------------|
| `initialize_market` | Create a new trading pair |
| `deposit` | Deposit tokens for trading |
| `withdraw` | Withdraw available tokens |
| `place_order` | Submit encrypted limit order |
| `cancel_order` | Cancel an order |
| `match_orders` | Trigger MPC matching |
| `settle_trade` | Execute matched trade |

### Encrypted Functions (Arcis)

| Function | Description |
|----------|-------------|
| `add_order` | Insert order into encrypted orderbook |
| `remove_order` | Remove order by ID |
| `match_book` | Find crossing orders, reveal execution |

## Usage Example

```typescript
import { DuskExchangeClient } from "./client";

const client = new DuskExchangeClient(connection, wallet);

// Create market (admin)
const market = await client.createMarket(SOL_MINT, USDC_MINT, 30); // 0.3% fee

// Deposit tokens
await client.deposit(market, 10_000_000_000, true);  // 10 SOL
await client.deposit(market, 1000_000_000, false);   // 1000 USDC

// Place encrypted order (price hidden!)
const orderId = await client.placeOrder(
  market,
  100_500_000,  // $100.50 (encrypted)
  1_000_000_000, // 1 SOL (encrypted)
  true           // buy
);

// Match orders (anyone can call)
const result = await client.matchOrders(market);

if (result.matched) {
  console.log(`Matched at $${result.executionPrice / 1_000_000}`);
  await client.settleTrade(result.settlement);
}
```

## Security

- Orders encrypted using x25519 key exchange with Arcium MXE
- Only MPC cluster can decrypt order data
- Settlement requires PDA authority signatures
- Self-trade prevention in matching logic

## Roadmap

- [x] Core Anchor program structure
- [x] Market, deposit, withdraw instructions
- [x] Arcis circuit definitions
- [ ] Arcium testnet integration
- [ ] TypeScript SDK
- [ ] React frontend
- [ ] MEV demo video

## Resources

- [Arcium Documentation](https://docs.arcium.com)
- [Anchor Book](https://www.anchor-lang.com/docs)
- [Solana Cookbook](https://solanacookbook.com)

## License

MIT

## Acknowledgments

- [Arcium](https://arcium.com) for MPC infrastructure
- [Solana Foundation](https://solana.com) for the hackathon
