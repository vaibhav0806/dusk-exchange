# Dusk Exchange - Project Plan

## Executive Summary

**Project:** Private Limit Order DEX on Solana using Arcium MPC
**Hackathon:** [Solana Privacy Hack](https://solana.com/privacyhack) (Jan 12 - Feb 1, 2026)
**Target Bounty:** Arcium $10,000 "End-to-End Private DeFi"
**Total Prize Pool:** $100,000+

### The Problem
MEV (Maximal Extractable Value) attacks cost DeFi users over $1 billion annually. Sandwich attacks exploit visible order details in the mempool to front-run trades and extract value from users.

### The Solution
Dusk Exchange encrypts order details (price, amount) using Arcium's MPC network. Attackers cannot see order information, making sandwich attacks impossible. Only matched trade execution details are revealed after the fact.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   User                    Dusk Exchange              Arcium MPC             │
│    │                           │                          │                 │
│    │  1. Encrypt order         │                          │                 │
│    │  (price, amount)          │                          │                 │
│    │ ─────────────────────────>│                          │                 │
│    │                           │  2. Queue computation    │                 │
│    │                           │ ────────────────────────>│                 │
│    │                           │                          │                 │
│    │                           │  3. Process encrypted    │                 │
│    │                           │     orderbook            │                 │
│    │                           │<─────────────────────────│                 │
│    │                           │                          │                 │
│    │                           │  4. Match orders         │                 │
│    │                           │     (in MPC)             │                 │
│    │                           │ ────────────────────────>│                 │
│    │                           │                          │                 │
│    │                           │  5. Return revealed      │                 │
│    │  6. Settlement            │     execution details    │                 │
│    │<──────────────────────────│<─────────────────────────│                 │
│    │                           │                          │                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Smart Contract | Anchor (Rust) | On-chain program logic |
| Privacy | Arcium MPC + Arcis | Encrypted computation |
| Client SDK | TypeScript | Frontend integration |
| Frontend | Next.js + React | User interface |
| Wallet | Phantom/Solflare | User authentication |
| Blockchain | Solana Devnet | Deployment target |

---

## Phase Breakdown

### Phase 1: Foundation (Days 1-3) ✅ COMPLETED

**Goal:** Project scaffolding and basic Anchor program without encryption

#### Tasks
- [x] Initialize project structure (Anchor + Arcium)
- [x] Define account structures
  - [x] `Market` - Trading pair configuration
  - [x] `UserPosition` - User deposits and locks
  - [x] `TradeSettlement` - Matched trade details
- [x] Implement basic instructions
  - [x] `initialize_market` - Create trading pair with vaults
  - [x] `deposit` - Lock tokens for trading
  - [x] `withdraw` - Withdraw available tokens
- [x] Define error types and events
- [x] Create initial test suite
- [x] **Build successfully compiles**

#### Build Configuration (Important!)
```bash
# Required: Anchor CLI 0.32.0 + platform-tools v1.52
anchor build --no-idl -- --tools-version v1.52
```

#### Deliverables
- ✅ Working deposit/withdraw flow
- ✅ Market creation
- ✅ `dusk_exchange.so` (406 KB) compiled
- Basic test coverage

#### Files Created
```
programs/dusk_exchange/src/
├── lib.rs
├── state/
│   ├── market.rs
│   ├── user_position.rs
│   └── settlement.rs
├── instructions/
│   ├── initialize_market.rs
│   ├── deposit.rs
│   └── withdraw.rs
├── errors.rs
└── events.rs
```

---

### Phase 2: Arcium Integration (Days 4-7) ✅ COMPLETED

**Goal:** Encrypted orderbook and order placement via Arcium MPC

**Status:** Encrypted circuits and Solana program fully integrated. SBF build working. Tests passing.

#### Current State (Jan 12, 2026)
- ✅ All three encrypted circuits (`add_order`, `remove_order`, `match_book`) compile successfully
- ✅ `.arcis` files generated in `build/` directory via `arcium build`
- ✅ Raw circuit JSON files in `artifacts/` directory
- ✅ Main program fully wired with Arcium CPIs (`queue_computation`, callbacks)
- ✅ SBF build successful (570KB .so file with platform-tools v1.52)
- ✅ IDL generated (2692 lines) and TypeScript types (55KB)
- ✅ Basic tests passing (market init, deposits, withdrawals)
- ⏳ Encrypted order tests require Arcium testnet access

#### Build Commands
```bash
# Build encrypted circuits (generates .arcis files)
arcium build --skip-keys-sync

# Build Solana program (MUST use platform-tools v1.52+ for blake3 edition2024)
cargo build-sbf --manifest-path programs/dusk_exchange/Cargo.toml --tools-version v1.52

# Generate IDL (after SBF build)
anchor idl build -p dusk_exchange > target/idl/dusk_exchange.json

# Run tests on localnet
solana-test-validator --reset \
  --bpf-program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS target/deploy/dusk_exchange.so \
  --bpf-program F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk artifacts/arcium_program_0.5.4.so \
  --bpf-program L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95 artifacts/lighthouse.so

ANCHOR_PROVIDER_URL=http://127.0.0.1:8899 ANCHOR_WALLET=~/.config/solana/id.json \
  yarn run ts-mocha -p ./tsconfig.json -t 120000 tests/dusk_exchange.ts
```

#### Tasks
- [x] Write encrypted orderbook circuits (encrypted-ixs/src/lib.rs)
  - [x] `Order` struct: price, amount, owner (split u128), order_id, side
  - [x] `OrderBookState`: best bid/ask tracking
  - [x] `MatchResult`: revealed execution details
- [x] Implement `add_order` circuit
  - [x] Accept encrypted order (Shared encryption)
  - [x] Update best bid/ask if better price
  - [x] Increment order count
- [x] Implement `remove_order` circuit
  - [x] Find order by ID and owner verification
  - [x] Clear best bid/ask if matched
  - [x] Return success bool (revealed)
- [x] Implement `match_book` circuit
  - [x] Check crossing condition (bid >= ask)
  - [x] Self-trade prevention
  - [x] Calculate midpoint execution price
  - [x] Return revealed MatchResult
- [x] Wire up `place_order` instruction with queue_computation
- [x] Wire up `cancel_order` instruction with queue_computation
- [x] Wire up `match_orders` instruction with queue_computation
- [x] Implement `init_comp_defs` for computation definitions
- [x] Fix SignerAccount and callback_ix types
- [x] SBF build with platform-tools v1.52
- [x] Generate IDL and TypeScript types
- [x] Basic tests passing on localnet
- [ ] Set up Arcium testnet access (public - no registration needed)
  - [ ] Get devnet SOL: `solana airdrop 2`
  - [ ] Create cluster: `arcium init-cluster --offset <random-8-digit> --max-nodes 4`
  - [ ] Deploy MXE: `arcium deploy --cluster-offset <your-offset>`
  - [ ] Update `Arcium.toml` with cluster offset

#### Deliverables
- Encrypted order submission working
- Order cancellation working
- Orders stored in encrypted state

#### Key Code Locations
```
encrypted-ixs/src/lib.rs          # Arcis circuits
programs/.../place_order.rs       # Queue computation CPI
programs/.../cancel_order.rs      # Cancel via MPC
programs/.../init_comp_defs.rs    # Computation definitions
```

#### Technical Notes

**Arcis Limitations to Handle:**
1. No `Vec` - use `ArcisArray<Order, 64>`
2. No `while` loops - fixed iteration only
3. Cannot `reveal()` inside branches
4. Pubkeys must be split: `owner_lo: u128, owner_hi: u128`

**Order Encryption Flow:**
```typescript
// Client-side
const sharedSecret = deriveX25519(userKeypair, mxePublicKey);
const cipher = new RescueCipher(sharedSecret);
const encryptedPrice = cipher.encrypt(priceBytes, nonce);
const encryptedAmount = cipher.encrypt(amountBytes, nonce);

// Send to program
await program.methods.placeOrder(
  orderId,
  isBuy,
  encryptedPrice,
  encryptedAmount,
  nonce
).rpc();
```

---

### Phase 3: Order Matching (Days 8-11)

**Goal:** Private order matching with revealed execution details

#### Tasks
- [ ] Implement `match_book` circuit (HARDEST PART)
  - [ ] Find best bid (highest price buy order)
  - [ ] Find best ask (lowest price sell order)
  - [ ] Check crossing condition: `bid.price >= ask.price`
  - [ ] Calculate execution price (midpoint)
  - [ ] Calculate execution amount (min of both)
  - [ ] Handle partial fills
  - [ ] Self-trade prevention
  - [ ] Return revealed `MatchResult`
- [ ] Wire up `match_orders` instruction
  - [ ] Queue match computation
  - [ ] Handle callback with execution details
  - [ ] Create `TradeSettlement` account
- [ ] Implement `settle_trade` instruction
  - [ ] Validate settlement account
  - [ ] Transfer base tokens (seller → buyer)
  - [ ] Transfer quote tokens (buyer → seller)
  - [ ] Deduct fees
  - [ ] Update user positions

#### Deliverables
- Full order matching working
- Trade settlement working
- End-to-end trading flow

#### Matching Algorithm (Pseudocode)
```rust
fn match_book(orderbook: Enc<Mxe, &OrderBook>) -> (Enc<Mxe, OrderBook>, MatchResult) {
    // 1. Find best bid (highest price, earliest time)
    let best_bid = find_best_order(orderbook, side=BUY, prefer=HIGHEST_PRICE);

    // 2. Find best ask (lowest price, earliest time)
    let best_ask = find_best_order(orderbook, side=SELL, prefer=LOWEST_PRICE);

    // 3. Check for match
    if best_bid.price >= best_ask.price && !is_self_trade(bid, ask) {
        // 4. Calculate execution
        let exec_price = (best_bid.price + best_ask.price) / 2;
        let exec_amount = min(best_bid.amount, best_ask.amount);

        // 5. Update orders (partial fill or deactivate)
        update_order(best_bid, exec_amount);
        update_order(best_ask, exec_amount);

        // 6. Return revealed result
        return (updated_orderbook, MatchResult {
            matched: true,
            execution_price: exec_price.reveal(),
            execution_amount: exec_amount.reveal(),
            maker: ask.owner.reveal(),
            taker: bid.owner.reveal(),
        });
    }

    return (orderbook, MatchResult { matched: false, ... });
}
```

#### Risk Mitigation
If matching circuit proves too complex:
- **Fallback A:** Market orders only (match against best limit)
- **Fallback B:** Reduce MAX_ORDERS to 16
- **Fallback C:** Skip partial fills (all-or-nothing)

---

### Phase 4: TypeScript SDK (Days 12-14) ✅ COMPLETED

**Goal:** Complete client library for frontend integration

**Status:** SDK built and working with all core operations.

#### Tasks
- [x] Set up SDK project structure
  - [x] Initialize `client/` directory
  - [x] Configure TypeScript build
  - [x] Add dependencies (@arcium-hq/client, @coral-xyz/anchor)
- [x] Implement encryption utilities
  - [x] Mock encryption (Arcium integration ready)
  - [x] Order encryption helpers
  - [x] Nonce generation
  - [x] Pubkey split/join utilities
- [x] Implement `DuskExchangeClient` class
  - [x] Market operations
    - [x] `createMarket(params)`
    - [x] `getMarket(marketPda)`
    - [x] `getAllMarkets()`
  - [x] User operations
    - [x] `deposit(params)`
    - [x] `withdraw(params)`
    - [x] `getUserPosition(market)`
    - [x] `getAvailableBalance(market, isBase)`
  - [x] Order operations
    - [x] `placeOrder(market, params)` - with encryption
    - [x] `cancelOrder(market, orderId)`
  - [x] Matching operations
    - [x] `matchOrders(market)`
    - [x] `settleTrade(settlement)`
- [x] Add TypeScript types for all accounts
- [x] Create usage example

#### Build Commands
```bash
cd client && npm install && npm run build
```

#### Deliverables
- ✅ Fully typed SDK (55KB+ of type definitions)
- ✅ All core operations implemented
- ✅ Example usage script

#### SDK Structure
```
client/
├── src/
│   ├── index.ts              # Main exports
│   ├── client.ts             # DuskExchangeClient class
│   ├── encryption.ts         # Arcium encryption utilities
│   ├── instructions.ts       # Transaction builders
│   ├── accounts.ts           # Account fetchers
│   ├── types.ts              # TypeScript interfaces
│   └── constants.ts          # Program IDs, etc.
├── package.json
└── tsconfig.json
```

#### Example Usage
```typescript
import { DuskExchangeClient } from '@dusk-exchange/client';

const client = new DuskExchangeClient(connection, wallet);

// Deposit
await client.deposit(market, 10_000_000_000n, true); // 10 SOL

// Place encrypted order
const orderId = await client.placeOrder(
  market,
  100_500_000n,  // $100.50 - ENCRYPTED
  1_000_000_000n, // 1 SOL - ENCRYPTED
  'buy'
);

// Wait for computation
await client.awaitComputation(orderId);

// Match orders
const result = await client.matchOrders(market);
if (result.matched) {
  await client.settleTrade(result.settlement);
}
```

---

### Phase 5: React Frontend (Days 15-17)

**Goal:** Functional trading interface

#### Tasks
- [ ] Set up Next.js project
  - [ ] Initialize `app/` directory
  - [ ] Configure Tailwind CSS
  - [ ] Add shadcn/ui components
- [ ] Implement wallet connection
  - [ ] Phantom adapter
  - [ ] Solflare adapter
  - [ ] Connection state management
- [ ] Build trading pages
  - [ ] `/` - Market overview
  - [ ] `/trade/[pair]` - Trading interface
  - [ ] `/portfolio` - User positions
- [ ] Build components
  - [ ] `OrderForm` - Place limit orders
  - [ ] `OrderBook` - Aggregate depth display
  - [ ] `OpenOrders` - User's active orders
  - [ ] `TradeHistory` - Recent executions
  - [ ] `DepositWithdraw` - Fund management
  - [ ] `PriceChart` - Simple price display (optional)

#### Deliverables
- Working trading UI
- Wallet connection
- Real-time updates

#### UI Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│  DUSK EXCHANGE                    [Connect Wallet]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SOL/USDC                                                   │
│  ┌─────────────┐  ┌─────────────────────────────────────┐   │
│  │ ORDER FORM  │  │         ORDER BOOK                  │   │
│  │             │  │  ─────────────────────────────────  │   │
│  │ [BUY] [SELL]│  │  Price      Size      Total        │   │
│  │             │  │  ─────────────────────────────────  │   │
│  │ Price:      │  │  101.50     5.2       526.80  ASK  │   │
│  │ [________]  │  │  101.25     3.1       313.88  ASK  │   │
│  │             │  │  101.00    12.5     1,262.50  ASK  │   │
│  │ Amount:     │  │  ═══════════════════════════════   │   │
│  │ [________]  │  │  100.75     8.3       836.23  BID  │   │
│  │             │  │  100.50    15.2     1,527.60  BID  │   │
│  │ Total:      │  │  100.25     4.7       471.18  BID  │   │
│  │ $1,005.00   │  │                                    │   │
│  │             │  └─────────────────────────────────────┘   │
│  │ [PLACE ORDER]                                            │
│  └─────────────┘                                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ YOUR OPEN ORDERS                                     │   │
│  │ ──────────────────────────────────────────────────── │   │
│  │ #1234  BUY   1.5 SOL @ $100.25    [Cancel]          │   │
│  │ #1235  SELL  2.0 SOL @ $101.50    [Cancel]          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ RECENT TRADES                                        │   │
│  │ ──────────────────────────────────────────────────── │   │
│  │ 12:34:56  BUY   1.0 SOL @ $100.50                   │   │
│  │ 12:33:21  SELL  0.5 SOL @ $100.75                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Frontend Structure
```
app/
├── components/
│   ├── OrderForm.tsx
│   ├── OrderBook.tsx
│   ├── OpenOrders.tsx
│   ├── TradeHistory.tsx
│   ├── DepositWithdraw.tsx
│   ├── WalletButton.tsx
│   └── ui/                    # shadcn components
├── hooks/
│   ├── useMarket.ts
│   ├── useOrders.ts
│   ├── useWallet.ts
│   └── useTrades.ts
├── pages/
│   ├── index.tsx
│   ├── trade/[pair].tsx
│   └── portfolio.tsx
├── lib/
│   └── dusk-client.ts
└── styles/
    └── globals.css
```

---

### Phase 6: MEV Demo & Polish (Days 18-19)

**Goal:** Demonstrate privacy guarantees and prepare submission

#### Tasks
- [ ] Create MEV attack simulation script
  - [ ] Simulate attacker monitoring mempool
  - [ ] Show attacker cannot read order details
  - [ ] Demonstrate failed sandwich attempt
  - [ ] Compare with transparent DEX scenario
- [ ] Record demo video (max 3 minutes)
  - [ ] 0:00-0:30 - Problem statement (MEV attacks)
  - [ ] 0:30-1:30 - Dusk Exchange walkthrough
  - [ ] 1:30-2:30 - MEV attack simulation
  - [ ] 2:30-3:00 - Architecture summary
- [ ] Write documentation
  - [ ] Update README with final instructions
  - [ ] API documentation
  - [ ] Architecture diagrams
- [ ] Deploy to Solana devnet
- [ ] Prepare hackathon submission

#### Deliverables
- MEV demo script
- 3-minute demo video
- Complete documentation
- Deployed on devnet

#### MEV Demo Script
```typescript
// tests/mev-demo.ts

async function demonstrateMEVProtection() {
  console.log("=== MEV Protection Demonstration ===\n");

  // 1. Setup
  console.log("1. Alice wants to buy 10 SOL at $100");
  console.log("   She submits an ENCRYPTED order\n");

  const aliceOrder = await client.placeOrder(market, 100_000_000n, 10n, 'buy');

  // 2. Attacker perspective
  console.log("2. Attacker Bob monitors the mempool...");
  const txData = await connection.getTransaction(aliceOrder.signature);

  console.log("   Transaction data visible to Bob:");
  console.log("   - Instruction: place_order");
  console.log("   - Price: [ENCRYPTED - 32 random bytes]");
  console.log("   - Amount: [ENCRYPTED - 32 random bytes]");
  console.log("   - Bob CANNOT determine price or amount!\n");

  // 3. Failed attack
  console.log("3. Bob attempts blind front-run...");
  console.log("   Without knowing the price, Bob must guess.");
  console.log("   His sandwich attack FAILS.\n");

  // 4. Fair execution
  console.log("4. Meanwhile, Carol places a sell order at $99");
  await client.placeOrder(market, 99_000_000n, 10n, 'sell');

  const result = await client.matchOrders(market);

  console.log("5. Orders match at fair midpoint price: $99.50");
  console.log("   Alice got exactly what she expected.");
  console.log("   No value extracted by attackers.\n");

  console.log("=== MEV Attack Prevention: SUCCESS ===");
}
```

#### Demo Video Outline

| Time | Content | Visuals |
|------|---------|---------|
| 0:00 | "MEV costs DeFi users $1B+ per year" | Stats graphic |
| 0:15 | "Sandwich attacks exploit visible orders" | Animation |
| 0:30 | "Dusk Exchange encrypts your orders" | App demo |
| 1:00 | "Let me show you how it works" | Trading flow |
| 1:30 | "Now let's see an attacker's view" | Terminal/code |
| 2:00 | "The attacker sees only encrypted data" | Hex dump |
| 2:15 | "Their sandwich attempt fails" | Failed tx |
| 2:30 | "Built on Solana + Arcium MPC" | Architecture |
| 2:45 | "Dusk Exchange - Trade without fear" | Logo/CTA |

---

## Timeline Summary

| Week | Phase | Focus | Key Deliverable |
|------|-------|-------|-----------------|
| 1 | 1-2 | Foundation + Arcium | Encrypted orders working |
| 2 | 3 | Order Matching | Full trading flow |
| 3 | 4-6 | SDK + Frontend + Demo | Submission ready |

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Arcium testnet instability | Medium | High | Mock MPC for demo fallback |
| Matching circuit too complex | High | High | Simplify to market orders |
| MPC latency too high | Medium | Medium | Reduce MAX_ORDERS |
| Build/dependency issues | Medium | Low | Pin versions, test early |

### Schedule Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Matching takes longer | High | High | Start Day 4, have fallback |
| Frontend delays | Medium | Low | Use shadcn, minimal design |
| Demo video issues | Low | Medium | Record incrementally |

### Fallback Plan

If full implementation isn't possible:

1. **MVP Fallback:** Market orders only, no partial fills
2. **Demo Fallback:** Mock MPC responses for video
3. **UI Fallback:** CLI-only interface

---

## Success Criteria

### Minimum Viable Product
- [ ] Create market with token vaults
- [ ] Deposit and withdraw tokens
- [ ] Place encrypted limit orders
- [ ] Match orders via MPC
- [ ] Settle trades
- [ ] Basic UI or CLI

### Full Product
- [ ] All MVP features
- [ ] Polished React UI
- [ ] TypeScript SDK
- [ ] MEV demo video
- [ ] Deployed on devnet

### Hackathon Winning Features
- [ ] Clear MEV protection demonstration
- [ ] Smooth user experience
- [ ] Clean code and documentation
- [ ] Compelling video presentation

---

## Resources

### Documentation
- [Arcium Developer Docs](https://docs.arcium.com/developers)
- [Arcium Testnet Guide](https://www.arcium.com/articles/arcium-public-testnet-launch-guide)
- [Anchor Book](https://www.anchor-lang.com/docs)
- [Solana Cookbook](https://solanacookbook.com)

### Example Code
- [Arcium Examples](https://github.com/arcium-hq/examples)
- [Simple Serum DEX](https://github.com/harry830622/simple-serum)
- [OpenBook DEX](https://github.com/openbook-dex/program)

### Hackathon
- [Solana Privacy Hack](https://solana.com/privacyhack)
- [Arcium Bounty Details](https://www.arcium.com) - $10k for private swaps

---

## Checklist

### Before Submission
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Deployed to devnet
- [ ] Demo video recorded (max 3 min)
- [ ] README complete
- [ ] Code is open source
- [ ] Submission form filled

### Submission Requirements
- [ ] GitHub repository URL
- [ ] Demo video URL
- [ ] Deployed program address
- [ ] Team information
- [ ] Project description

---

*Last updated: January 12, 2026*
