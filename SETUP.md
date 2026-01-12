# Dusk Exchange - Local Development Setup Guide

This guide documents the complete setup process for running Dusk Exchange locally, including common issues and their solutions.

## Prerequisites

Before starting, ensure you have:

- **Rust** (1.75+) - `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Solana CLI** (1.18+ or 3.0+) - `sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"`
- **Anchor CLI** (0.32.0) - `cargo install --git https://github.com/coral-xyz/anchor avm --force && avm install 0.32.0 && avm use 0.32.0`
- **Node.js** (18+) - https://nodejs.org/
- **Yarn** - `npm install -g yarn`

## Quick Start (TL;DR)

```bash
# 1. Install dependencies
yarn install
cd client && npm install && npm run build && cd ..
cd app && npm install && cd ..

# 2. Build the Solana program
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
cargo-build-sbf --tools-version v1.52 --manifest-path programs/dusk_exchange/Cargo.toml

# 3. Start local validator (Terminal 1)
solana-test-validator --reset \
  --bpf-program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS target/deploy/dusk_exchange.so \
  --bpf-program F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk artifacts/arcium_program_0.5.4.so \
  --bpf-program L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95 artifacts/lighthouse.so

# 4. Run tests (Terminal 2)
export ANCHOR_PROVIDER_URL=http://127.0.0.1:8899
export ANCHOR_WALLET=~/.config/solana/id.json
TS_NODE_PROJECT=./tsconfig.json ./node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 tests/dusk_exchange.ts

# 5. Start frontend (Terminal 3)
cd app && npm run dev
# Open http://localhost:3000
```

---

## Detailed Setup Steps

### Step 1: Clone and Install Dependencies

```bash
git clone <repository-url>
cd dusk-exchange

# Root dependencies
yarn install

# Client SDK
cd client && npm install && npm run build && cd ..

# Frontend app
cd app && npm install && cd ..
```

### Step 2: Create Solana Keypair (if not exists)

The Anchor framework requires a keypair at `~/.config/solana/id.json`:

```bash
# Check if keypair exists
ls ~/.config/solana/id.json

# If not, create one:
solana-keygen new --outfile ~/.config/solana/id.json
# OR use Node.js:
node -e "const { Keypair } = require('@solana/web3.js'); const fs = require('fs'); fs.mkdirSync(require('os').homedir() + '/.config/solana', { recursive: true }); fs.writeFileSync(require('os').homedir() + '/.config/solana/id.json', JSON.stringify(Array.from(Keypair.generate().secretKey)));"
```

### Step 3: Build the Solana Program

```bash
# Ensure Solana tools are in PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Build with platform-tools v1.52 (required for blake3 crate)
cargo-build-sbf --tools-version v1.52 --manifest-path programs/dusk_exchange/Cargo.toml
```

### Step 4: Start Local Validator

Open a **new terminal** and run:

```bash
solana-test-validator --reset \
  --bpf-program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS target/deploy/dusk_exchange.so \
  --bpf-program F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk artifacts/arcium_program_0.5.4.so \
  --bpf-program L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95 artifacts/lighthouse.so
```

Wait until you see `JSON RPC URL: http://127.0.0.1:8899`.

### Step 5: Run Tests

In another terminal:

```bash
export ANCHOR_PROVIDER_URL=http://127.0.0.1:8899
export ANCHOR_WALLET=~/.config/solana/id.json

# Run tests with explicit ts-node project config
TS_NODE_PROJECT=./tsconfig.json ./node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 tests/dusk_exchange.ts
```

Expected output: **6 passing, 5 pending** (pending tests require Arcium MPC nodes)

### Step 6: Start Frontend

```bash
cd app && npm run dev
```

Open http://localhost:3000 in your browser.

---

## Common Issues and Solutions

### Issue 1: `anchor idl build` fails with "No such file or directory"

**Symptoms:**
```
Error: No such file or directory (os error 2)
```

**Cause:** The `anchor idl build` command requires `solana-keygen` to be in PATH and a valid keypair at the configured wallet path.

**Solution:**
1. Ensure Solana tools are in PATH:
   ```bash
   export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
   ```
2. Create a keypair if missing (see Step 2 above)

---

### Issue 2: `cargo-build-sbf` requires `--tools-version v1.52`

**Symptoms:**
```
error: failed to download `blake3 v1.8.3`
Caused by: feature `edition2024` is required
```

**Cause:** The default `platform-tools` (v1.51) bundles `rustc 1.84` which doesn't support Rust edition 2024 required by the `blake3` crate.

**Solution:**
```bash
cargo-build-sbf --tools-version v1.52 --manifest-path programs/dusk_exchange/Cargo.toml
```

---

### Issue 3: `ts-mocha` moduleResolution error

**Symptoms:**
```
error TS6046: Argument for '--moduleResolution' option must be: 'node', 'classic', 'node16', 'nodenext'.
```

**Cause:** The `app/` folder has a different TypeScript configuration with `moduleResolution: "bundler"` which conflicts when yarn picks up the wrong `ts-mocha` binary.

**Solution:** Set `TS_NODE_PROJECT` explicitly:
```bash
TS_NODE_PROJECT=./tsconfig.json ./node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 tests/dusk_exchange.ts
```

---

### Issue 4: Tests fail with "Attempt to load a program that does not exist"

**Symptoms:**
```
Simulation failed. 
Message: Transaction simulation failed: Attempt to load a program that does not exist.
```

**Cause:** Program ID mismatch between the deployed program and the IDL/types files.

**Solution:** Ensure all files use the same program ID:

1. `programs/dusk_exchange/src/lib.rs` - `declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");`
2. `target/idl/dusk_exchange.json` - `"address": "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"`
3. `target/types/dusk_exchange.ts` - `"address": "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"`
4. `client/src/idl.ts` - `"address": "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"`
5. `client/src/constants.ts` - `DUSK_EXCHANGE_PROGRAM_ID`
6. `app/src/hooks/useDuskExchange.tsx` - `DUSK_PROGRAM_ID`
7. `Anchor.toml` - `[programs.localnet]` section

---

### Issue 5: Port already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill it
kill <PID>

# Or use a different port
cd app && npm run dev -- --port 3001
```

---

### Issue 6: `solana-test-validator` faucet error

**Symptoms:**
```
Error: failed to start faucet: Unable to bind faucet to 0.0.0.0:9900
```

**Solution:** Kill any existing validator processes:
```bash
pkill -f solana-test-validator
```

---

### Issue 7: `yarn run ts-mocha` command not found

**Symptoms:**
```
error Command "ts-mocha" not found.
```

**Solution:**
```bash
yarn add -D ts-mocha typescript mocha chai @types/mocha @types/chai
```

---

### Issue 8: Frontend Error "Module not found: Can't resolve 'pino-pretty'"

**Symptoms:**
```
Module not found: Can't resolve 'pino-pretty' in '.../node_modules/pino/lib'
```

**Cause:** A missing dependency required by one of the wallet adapter libraries.

**Solution:**
```bash
cd app && npm install pino-pretty
```

---

## Program IDs Reference

| Component | Address |
|-----------|---------|
| Dusk Exchange (localnet) | `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS` |
| Dusk Exchange (devnet) | `7LyfNf3Q7weRFCA316BepiMGWkKVY5aE4xYPrNzSFTRQ` |
| Arcium Program | `F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk` |
| Lighthouse | `L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95` |

---

## Frontend Mock Mode

The frontend (`app/src/hooks/useDuskExchange.tsx`) runs in **mock mode** by default, which:
- Simulates deposits/withdrawals locally
- Simulates order placement (without actual Arcium encryption)
- Updates UI state optimistically

This allows testing the full UX flow without running Arcium MPC nodes.

To connect to a real deployment, update `WalletProvider.tsx`:
```typescript
// For localnet:
const endpoint = useMemo(() => "http://127.0.0.1:8899", []);

// For devnet:
const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
```

---

## Running the MEV Demo

```bash
# Shell demo (no dependencies)
./scripts/mev-demo.sh

# TypeScript demo
cd scripts && npm install && npm run demo
```

---

## Troubleshooting Checklist

- [ ] Solana CLI in PATH? `which solana`
- [ ] Keypair exists? `ls ~/.config/solana/id.json`
- [ ] Local validator running? `curl http://127.0.0.1:8899 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'`
- [ ] Program deployed? Check with `getAccountInfo` RPC call
- [ ] Program IDs match across all files?
- [ ] Environment variables set? `echo $ANCHOR_PROVIDER_URL`

---

## Need Help?

- [Arcium Documentation](https://docs.arcium.com)
- [Anchor Book](https://www.anchor-lang.com/docs)
- [Solana Cookbook](https://solanacookbook.com)
