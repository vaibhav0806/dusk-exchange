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

### Phase 2: Arcium Integration (Days 4-7)

**Goal:** Encrypted orderbook and order placement via Arcium MPC

#### Tasks
- [ ] Set up Arcium testnet access
  - [ ] Register for cluster access at [arcium.com/testnet](https://arcium.com/testnet)
  - [ ] Get cluster offset assignment
  - [ ] Update `Arcium.toml` with credentials
- [ ] Define encrypted data types (Arcis)
  - [ ] `Order` struct with ArcisType derive
  - [ ] `OrderBook` with fixed-size ArcisArray
  - [ ] `MatchResult` for revealed outputs
- [ ] Implement `add_order` circuit
  - [ ] Accept encrypted order (Shared encryption)
  - [ ] Insert into MXE-owned orderbook
  - [ ] Maintain price-time priority (fixed iteration)
- [ ] Wire up `place_order` instruction
  - [ ] Initialize computation definition
  - [ ] Implement `queue_computation` CPI
  - [ ] Handle callback with `place_order_callback`
- [ ] Implement `remove_order` circuit
  - [ ] Find order by ID and owner
  - [ ] Mark as inactive
- [ ] Wire up `cancel_order` instruction

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

### Phase 4: TypeScript SDK (Days 12-14)

**Goal:** Complete client library for frontend integration

#### Tasks
- [ ] Set up SDK project structure
  - [ ] Initialize `client/` directory
  - [ ] Configure TypeScript build
  - [ ] Add dependencies (@arcium-hq/client, @coral-xyz/anchor)
- [ ] Implement encryption utilities
  - [ ] Key derivation (x25519)
  - [ ] Order encryption
  - [ ] Nonce generation
- [ ] Implement `DuskExchangeClient` class
  - [ ] Market operations
    - [ ] `createMarket(baseMint, quoteMint, feeBps)`
    - [ ] `getMarket(marketId)`
    - [ ] `getMarkets()`
  - [ ] User operations
    - [ ] `deposit(market, amount, isBase)`
    - [ ] `withdraw(market, amount, isBase)`
    - [ ] `getPosition(market)`
  - [ ] Order operations
    - [ ] `placeOrder(market, price, amount, side)`
    - [ ] `cancelOrder(market, orderId)`
    - [ ] `getUserOrders(market)`
  - [ ] Matching operations
    - [ ] `matchOrders(market)`
    - [ ] `settleTrade(settlement)`
- [ ] Implement computation finalization polling
- [ ] Add TypeScript types for all accounts

#### Deliverables
- Fully typed SDK
- All operations working
- Example usage scripts

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
