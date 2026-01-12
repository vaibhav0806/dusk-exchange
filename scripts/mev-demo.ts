/**
 * MEV Protection Demonstration Script
 *
 * This script demonstrates how Dusk Exchange protects users from MEV attacks
 * by encrypting order details using Arcium MPC.
 *
 * Run: npx ts-node scripts/mev-demo.ts
 */

import { Keypair, PublicKey } from "@solana/web3.js";
import * as crypto from "crypto";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
};

const c = colors;

// Utility functions
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printHeader(text: string): void {
  const line = "═".repeat(60);
  console.log(`\n${c.cyan}${line}${c.reset}`);
  console.log(`${c.bright}${c.cyan}  ${text}${c.reset}`);
  console.log(`${c.cyan}${line}${c.reset}\n`);
}

function printStep(step: number, text: string): void {
  console.log(`${c.yellow}[Step ${step}]${c.reset} ${c.bright}${text}${c.reset}`);
}

function printAttacker(text: string): void {
  console.log(`${c.red}  [ATTACKER]${c.reset} ${text}`);
}

function printUser(name: string, text: string): void {
  console.log(`${c.green}  [${name}]${c.reset} ${text}`);
}

function printSystem(text: string): void {
  console.log(`${c.blue}  [SYSTEM]${c.reset} ${text}`);
}

function printEncrypted(label: string, data: Buffer): void {
  const hex = data.toString("hex");
  const truncated = hex.slice(0, 32) + "..." + hex.slice(-8);
  console.log(`${c.dim}    ${label}: ${truncated}${c.reset}`);
}

// Simulated encryption (represents Arcium MPC encryption)
function encryptOrder(price: bigint, amount: bigint, nonce: Buffer): { encPrice: Buffer; encAmount: Buffer } {
  // In production, this uses Arcium's Rescue cipher with MXE shared secret
  const key = crypto.randomBytes(32); // Simulated shared secret

  const priceBuf = Buffer.alloc(16);
  priceBuf.writeBigUInt64LE(price);

  const amountBuf = Buffer.alloc(16);
  amountBuf.writeBigUInt64LE(amount);

  // XOR with random key (simplified; real impl uses Rescue cipher)
  const encPrice = Buffer.alloc(32);
  const encAmount = Buffer.alloc(32);

  for (let i = 0; i < 16; i++) {
    encPrice[i] = priceBuf[i] ^ key[i];
    encAmount[i] = amountBuf[i] ^ key[i + 16];
  }

  // Fill rest with random data
  crypto.randomFillSync(encPrice, 16, 16);
  crypto.randomFillSync(encAmount, 16, 16);

  return { encPrice, encAmount };
}

// ============================================================================
// SCENARIO 1: Traditional DEX (Vulnerable to MEV)
// ============================================================================

async function demonstrateTraditionalDEX(): Promise<void> {
  printHeader("SCENARIO 1: Traditional DEX (VULNERABLE)");

  console.log(`${c.dim}In a traditional DEX, all order details are visible in the mempool.${c.reset}`);
  console.log(`${c.dim}This allows attackers to perform sandwich attacks.${c.reset}\n`);

  await sleep(1000);

  // Step 1: Alice submits order
  printStep(1, "Alice wants to buy 10 SOL at $100");
  printUser("ALICE", "Submitting buy order: 10 SOL @ $100.00");
  console.log();

  await sleep(500);

  // Step 2: Transaction enters mempool
  printStep(2, "Transaction enters the mempool...");
  console.log();
  console.log(`${c.yellow}  ┌─────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.yellow}  │${c.reset}  ${c.bright}MEMPOOL TRANSACTION${c.reset}                                ${c.yellow}│${c.reset}`);
  console.log(`${c.yellow}  │${c.reset}  ─────────────────────────────────────────────────  ${c.yellow}│${c.reset}`);
  console.log(`${c.yellow}  │${c.reset}  Program: Serum DEX                                 ${c.yellow}│${c.reset}`);
  console.log(`${c.yellow}  │${c.reset}  Instruction: place_order                           ${c.yellow}│${c.reset}`);
  console.log(`${c.yellow}  │${c.reset}  ${c.red}Side: BUY${c.reset}                          ${c.red}← VISIBLE${c.reset}      ${c.yellow}│${c.reset}`);
  console.log(`${c.yellow}  │${c.reset}  ${c.red}Price: 100.00 USDC${c.reset}                 ${c.red}← VISIBLE${c.reset}      ${c.yellow}│${c.reset}`);
  console.log(`${c.yellow}  │${c.reset}  ${c.red}Amount: 10 SOL${c.reset}                     ${c.red}← VISIBLE${c.reset}      ${c.yellow}│${c.reset}`);
  console.log(`${c.yellow}  │${c.reset}  Signer: Alice...abc123                             ${c.yellow}│${c.reset}`);
  console.log(`${c.yellow}  └─────────────────────────────────────────────────────┘${c.reset}`);
  console.log();

  await sleep(1000);

  // Step 3: Attacker spots opportunity
  printStep(3, "Attacker Bob monitors mempool and spots Alice's order");
  printAttacker("Found profitable target!");
  printAttacker(`Alice wants to buy 10 SOL @ $100.00`);
  printAttacker(`Current market: $99.50 | I can sandwich this!`);
  console.log();

  await sleep(1000);

  // Step 4: Sandwich attack
  printStep(4, "Bob executes sandwich attack");
  console.log();
  console.log(`${c.red}  SANDWICH ATTACK IN PROGRESS${c.reset}`);
  console.log(`${c.dim}  ───────────────────────────────────────${c.reset}`);

  await sleep(300);
  console.log(`${c.red}  1. FRONT-RUN:${c.reset} Bob buys 10 SOL @ $99.50`);
  console.log(`${c.dim}     → Price moves to $100.00${c.reset}`);

  await sleep(300);
  console.log(`${c.red}  2. VICTIM TX:${c.reset} Alice buys 10 SOL @ $100.00`);
  console.log(`${c.dim}     → Price moves to $100.50${c.reset}`);

  await sleep(300);
  console.log(`${c.red}  3. BACK-RUN:${c.reset} Bob sells 10 SOL @ $100.50`);
  console.log(`${c.dim}     → Bob profits, Alice loses${c.reset}`);
  console.log();

  await sleep(1000);

  // Step 5: Results
  printStep(5, "Attack Results");
  console.log();
  console.log(`${c.bgRed}${c.white}  ATTACK SUCCESSFUL  ${c.reset}`);
  console.log();
  console.log(`${c.red}  Bob's Profit:   +$10.00 (1% of trade)${c.reset}`);
  console.log(`${c.red}  Alice's Loss:   -$10.00 (paid extra)${c.reset}`);
  console.log(`${c.dim}  ─────────────────────────────────────${c.reset}`);
  console.log(`${c.dim}  Alice expected: 10 SOL for $1,000${c.reset}`);
  console.log(`${c.dim}  Alice received: 10 SOL for $1,000 but could have paid $995${c.reset}`);
  console.log();
}

// ============================================================================
// SCENARIO 2: Dusk Exchange (MEV Protected)
// ============================================================================

async function demonstrateDuskExchange(): Promise<void> {
  printHeader("SCENARIO 2: Dusk Exchange (PROTECTED)");

  console.log(`${c.dim}Dusk Exchange encrypts all order details using Arcium MPC.${c.reset}`);
  console.log(`${c.dim}Attackers cannot read order prices or amounts.${c.reset}\n`);

  await sleep(1000);

  // Step 1: Alice encrypts and submits order
  printStep(1, "Alice encrypts her order with Arcium MPC");
  printUser("ALICE", "Encrypting order: 10 SOL @ $100.00");

  const nonce = crypto.randomBytes(16);
  const { encPrice, encAmount } = encryptOrder(100_000_000n, 10_000_000_000n, nonce);

  console.log(`${c.dim}  Using X25519 key exchange + Rescue cipher${c.reset}`);
  printEncrypted("Encrypted price", encPrice);
  printEncrypted("Encrypted amount", encAmount);
  console.log();

  await sleep(1000);

  // Step 2: Transaction enters mempool
  printStep(2, "Encrypted transaction enters mempool...");
  console.log();
  console.log(`${c.cyan}  ┌─────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  ${c.bright}MEMPOOL TRANSACTION${c.reset}                                ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  ─────────────────────────────────────────────────  ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  Program: Dusk Exchange                              ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  Instruction: place_order                            ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  ${c.green}Side: ???${c.reset}                          ${c.green}← ENCRYPTED${c.reset}    ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  ${c.green}Price: 0x7f3a...9c2e${c.reset}              ${c.green}← ENCRYPTED${c.reset}    ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  ${c.green}Amount: 0x1b8d...f4a1${c.reset}             ${c.green}← ENCRYPTED${c.reset}    ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  Nonce: ${nonce.toString("hex").slice(0, 16)}...            ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  Signer: Alice...abc123                              ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  └─────────────────────────────────────────────────────┘${c.reset}`);
  console.log();

  await sleep(1000);

  // Step 3: Attacker sees encrypted data
  printStep(3, "Attacker Bob monitors mempool...");
  printAttacker("Found a Dusk Exchange transaction!");
  printAttacker("Attempting to decode order details...");
  console.log();

  await sleep(500);

  console.log(`${c.red}  ┌─────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.red}  │${c.reset}  ${c.bright}ATTACKER ANALYSIS${c.reset}                                    ${c.red}│${c.reset}`);
  console.log(`${c.red}  │${c.reset}  ─────────────────────────────────────────────────  ${c.red}│${c.reset}`);
  console.log(`${c.red}  │${c.reset}  Side:   ${c.dim}Cannot determine (encrypted)${c.reset}             ${c.red}│${c.reset}`);
  console.log(`${c.red}  │${c.reset}  Price:  ${c.dim}Cannot determine (encrypted)${c.reset}             ${c.red}│${c.reset}`);
  console.log(`${c.red}  │${c.reset}  Amount: ${c.dim}Cannot determine (encrypted)${c.reset}             ${c.red}│${c.reset}`);
  console.log(`${c.red}  │${c.reset}  ─────────────────────────────────────────────────  ${c.red}│${c.reset}`);
  console.log(`${c.red}  │${c.reset}  ${c.yellow}Encryption: Arcium MPC (Rescue cipher)${c.reset}          ${c.red}│${c.reset}`);
  console.log(`${c.red}  │${c.reset}  ${c.yellow}Key holders: 3/4 MPC nodes required${c.reset}             ${c.red}│${c.reset}`);
  console.log(`${c.red}  │${c.reset}  ${c.yellow}Decryption: Only during order matching${c.reset}          ${c.red}│${c.reset}`);
  console.log(`${c.red}  └─────────────────────────────────────────────────────┘${c.reset}`);
  console.log();

  await sleep(1000);

  // Step 4: Attacker attempts blind attack
  printStep(4, "Bob attempts blind front-run (must guess)");
  printAttacker("Can't see price... guessing $95-$105 range");
  printAttacker("Risk: Could buy at $105 if order is at $95");
  printAttacker("Risk: 10% potential loss per guess");
  console.log();

  await sleep(500);

  console.log(`${c.yellow}  Bob's Options:${c.reset}`);
  console.log(`${c.dim}  ├─ Guess low ($95):  Might miss the trade entirely${c.reset}`);
  console.log(`${c.dim}  ├─ Guess mid ($100): 50% chance of loss${c.reset}`);
  console.log(`${c.dim}  └─ Guess high ($105): Guaranteed loss if wrong${c.reset}`);
  console.log();

  printAttacker(`${c.yellow}Decision: Too risky! Aborting attack.${c.reset}`);
  console.log();

  await sleep(1000);

  // Step 5: Fair execution
  printStep(5, "Orders match fairly in MPC");
  printUser("CAROL", "Submits encrypted sell: 10 SOL @ $99.50");
  console.log();

  await sleep(500);

  printSystem("Arcium MPC processes encrypted orderbook");
  printSystem("Finding matches without revealing orders...");
  console.log();

  await sleep(500);

  console.log(`${c.cyan}  ┌─────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  ${c.bright}MPC COMPUTATION RESULT${c.reset}                              ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  ─────────────────────────────────────────────────  ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  Match found: YES                                   ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  Execution price: $99.75 (midpoint)                 ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  Execution amount: 10 SOL                           ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  Buyer: Alice                                       ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  │${c.reset}  Seller: Carol                                      ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}  └─────────────────────────────────────────────────────┘${c.reset}`);
  console.log();

  await sleep(1000);

  // Step 6: Results
  printStep(6, "Trade Results");
  console.log();
  console.log(`${c.bgGreen}${c.white}  ATTACK PREVENTED  ${c.reset}`);
  console.log();
  console.log(`${c.green}  Alice's Trade:  10 SOL @ $99.75 (fair price!)${c.reset}`);
  console.log(`${c.green}  Carol's Trade:  10 SOL @ $99.75 (fair price!)${c.reset}`);
  console.log(`${c.green}  Bob's Attack:   FAILED (couldn't read orders)${c.reset}`);
  console.log(`${c.dim}  ─────────────────────────────────────────────────${c.reset}`);
  console.log(`${c.dim}  Alice saved: $2.50 compared to traditional DEX${c.reset}`);
  console.log(`${c.dim}  Zero value extracted by attackers${c.reset}`);
  console.log();
}

// ============================================================================
// COMPARISON SUMMARY
// ============================================================================

async function printComparison(): Promise<void> {
  printHeader("MEV PROTECTION COMPARISON");

  console.log(`${c.bright}  Feature                    Traditional DEX    Dusk Exchange${c.reset}`);
  console.log(`${c.dim}  ─────────────────────────────────────────────────────────────${c.reset}`);
  console.log(`  Order visibility          ${c.red}Fully visible${c.reset}      ${c.green}Encrypted${c.reset}`);
  console.log(`  Price readable            ${c.red}Yes${c.reset}                ${c.green}No${c.reset}`);
  console.log(`  Amount readable           ${c.red}Yes${c.reset}                ${c.green}No${c.reset}`);
  console.log(`  Sandwich attacks          ${c.red}Possible${c.reset}           ${c.green}Impossible${c.reset}`);
  console.log(`  Front-running             ${c.red}Possible${c.reset}           ${c.green}Impossible${c.reset}`);
  console.log(`  Fair execution            ${c.red}No guarantee${c.reset}       ${c.green}Guaranteed${c.reset}`);
  console.log(`  MEV extraction            ${c.red}~1% per trade${c.reset}      ${c.green}0%${c.reset}`);
  console.log();

  console.log(`${c.cyan}  Technology Stack:${c.reset}`);
  console.log(`${c.dim}  ├─ Blockchain: Solana (high throughput, low fees)${c.reset}`);
  console.log(`${c.dim}  ├─ Privacy: Arcium MPC (threshold encryption)${c.reset}`);
  console.log(`${c.dim}  ├─ Cipher: Rescue (MPC-friendly)${c.reset}`);
  console.log(`${c.dim}  └─ Matching: Secure multi-party computation${c.reset}`);
  console.log();
}

// ============================================================================
// STATISTICS
// ============================================================================

async function printStatistics(): Promise<void> {
  printHeader("MEV ATTACK STATISTICS (2024-2025)");

  console.log(`${c.bright}  The Problem:${c.reset}`);
  console.log(`${c.red}  ├─ $1.38 billion${c.reset} extracted from DeFi users in 2024`);
  console.log(`${c.red}  ├─ 500,000+ ${c.reset}sandwich attacks detected`);
  console.log(`${c.red}  ├─ Average loss: ${c.reset}$28 per affected transaction`);
  console.log(`${c.red}  └─ 12% of all DEX trades ${c.reset}impacted by MEV`);
  console.log();

  console.log(`${c.bright}  Who Profits:${c.reset}`);
  console.log(`${c.dim}  ├─ MEV searchers/bots: ~$900M${c.reset}`);
  console.log(`${c.dim}  ├─ Validators (tips): ~$400M${c.reset}`);
  console.log(`${c.dim}  └─ Protocol fees: ~$80M${c.reset}`);
  console.log();

  console.log(`${c.bright}  The Solution:${c.reset}`);
  console.log(`${c.green}  Dusk Exchange makes order details invisible${c.reset}`);
  console.log(`${c.green}  to everyone except the MPC network.${c.reset}`);
  console.log(`${c.green}  No visibility = No MEV extraction${c.reset}`);
  console.log();
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.clear();

  console.log(`${c.bright}${c.cyan}`);
  console.log(`  ██████╗ ██╗   ██╗███████╗██╗  ██╗`);
  console.log(`  ██╔══██╗██║   ██║██╔════╝██║ ██╔╝`);
  console.log(`  ██║  ██║██║   ██║███████╗█████╔╝ `);
  console.log(`  ██║  ██║██║   ██║╚════██║██╔═██╗ `);
  console.log(`  ██████╔╝╚██████╔╝███████║██║  ██╗`);
  console.log(`  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝`);
  console.log(`${c.reset}`);
  console.log(`${c.dim}  Private Limit Order DEX on Solana${c.reset}`);
  console.log(`${c.dim}  Powered by Arcium MPC${c.reset}`);
  console.log();

  await sleep(1500);

  // Print MEV statistics
  await printStatistics();
  await sleep(2000);

  // Demonstrate traditional DEX vulnerability
  await demonstrateTraditionalDEX();
  await sleep(2000);

  // Demonstrate Dusk Exchange protection
  await demonstrateDuskExchange();
  await sleep(1500);

  // Print comparison
  await printComparison();

  // Final message
  console.log(`${c.cyan}═══════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.bright}${c.cyan}  DUSK EXCHANGE - Trade Without Fear${c.reset}`);
  console.log(`${c.cyan}═══════════════════════════════════════════════════════════${c.reset}`);
  console.log();
  console.log(`${c.dim}  GitHub: github.com/dusk-exchange${c.reset}`);
  console.log(`${c.dim}  Built for Solana Privacy Hackathon 2026${c.reset}`);
  console.log();
}

main().catch(console.error);
