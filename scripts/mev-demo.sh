#!/bin/bash
#
# MEV Protection Demo - Dusk Exchange
# A visual demonstration of how encrypted orders prevent sandwich attacks
#
# Run: ./scripts/mev-demo.sh
#

# Colors
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
CYAN='\033[36m'
BG_RED='\033[41m'
BG_GREEN='\033[42m'

# Speed (set to 0 for instant, or higher for slower)
SPEED=${1:-1}

slow_print() {
    if [ "$SPEED" -gt 0 ]; then
        sleep "0.$SPEED"
    fi
    echo -e "$1"
}

pause() {
    if [ "$SPEED" -gt 0 ]; then
        sleep "$1"
    fi
}

clear

# ASCII Logo
echo -e "${BOLD}${CYAN}"
echo "  ██████╗ ██╗   ██╗███████╗██╗  ██╗"
echo "  ██╔══██╗██║   ██║██╔════╝██║ ██╔╝"
echo "  ██║  ██║██║   ██║███████╗█████╔╝ "
echo "  ██║  ██║██║   ██║╚════██║██╔═██╗ "
echo "  ██████╔╝╚██████╔╝███████║██║  ██╗"
echo "  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝"
echo -e "${RESET}"
echo -e "${DIM}  Private Limit Order DEX on Solana${RESET}"
echo -e "${DIM}  Powered by Arcium MPC${RESET}"
echo ""

pause 2

# Statistics
echo -e "\n${CYAN}════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}${CYAN}  MEV ATTACK STATISTICS (2024-2025)${RESET}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${RESET}\n"

slow_print "${BOLD}  The Problem:${RESET}"
slow_print "${RED}  ├─ \$1.38 billion${RESET} extracted from DeFi users in 2024"
slow_print "${RED}  ├─ 500,000+ ${RESET}sandwich attacks detected"
slow_print "${RED}  ├─ Average loss: ${RESET}\$28 per affected transaction"
slow_print "${RED}  └─ 12% of all DEX trades ${RESET}impacted by MEV"
echo ""

pause 2

# Scenario 1: Traditional DEX
echo -e "\n${CYAN}════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}${CYAN}  SCENARIO 1: Traditional DEX (VULNERABLE)${RESET}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${RESET}\n"

echo -e "${DIM}In a traditional DEX, all order details are visible in the mempool.${RESET}"
echo -e "${DIM}This allows attackers to perform sandwich attacks.${RESET}\n"

pause 1

slow_print "${YELLOW}[Step 1]${RESET} ${BOLD}Alice wants to buy 10 SOL at \$100${RESET}"
slow_print "${GREEN}  [ALICE]${RESET} Submitting buy order: 10 SOL @ \$100.00"
echo ""

pause 1

slow_print "${YELLOW}[Step 2]${RESET} ${BOLD}Transaction enters the mempool...${RESET}"
echo ""
echo -e "${YELLOW}  ┌─────────────────────────────────────────────────────┐${RESET}"
echo -e "${YELLOW}  │${RESET}  ${BOLD}MEMPOOL TRANSACTION${RESET}                                ${YELLOW}│${RESET}"
echo -e "${YELLOW}  │${RESET}  ─────────────────────────────────────────────────  ${YELLOW}│${RESET}"
echo -e "${YELLOW}  │${RESET}  Program: Serum DEX                                 ${YELLOW}│${RESET}"
echo -e "${YELLOW}  │${RESET}  Instruction: place_order                           ${YELLOW}│${RESET}"
echo -e "${YELLOW}  │${RESET}  ${RED}Side: BUY${RESET}                          ${RED}← VISIBLE${RESET}      ${YELLOW}│${RESET}"
echo -e "${YELLOW}  │${RESET}  ${RED}Price: 100.00 USDC${RESET}                 ${RED}← VISIBLE${RESET}      ${YELLOW}│${RESET}"
echo -e "${YELLOW}  │${RESET}  ${RED}Amount: 10 SOL${RESET}                     ${RED}← VISIBLE${RESET}      ${YELLOW}│${RESET}"
echo -e "${YELLOW}  │${RESET}  Signer: Alice...abc123                             ${YELLOW}│${RESET}"
echo -e "${YELLOW}  └─────────────────────────────────────────────────────┘${RESET}"
echo ""

pause 1

slow_print "${YELLOW}[Step 3]${RESET} ${BOLD}Attacker Bob monitors mempool${RESET}"
slow_print "${RED}  [ATTACKER]${RESET} Found profitable target!"
slow_print "${RED}  [ATTACKER]${RESET} Alice wants to buy 10 SOL @ \$100.00"
slow_print "${RED}  [ATTACKER]${RESET} Current market: \$99.50 | I can sandwich this!"
echo ""

pause 1

slow_print "${YELLOW}[Step 4]${RESET} ${BOLD}Bob executes sandwich attack${RESET}"
echo ""
echo -e "${RED}  SANDWICH ATTACK IN PROGRESS${RESET}"
echo -e "${DIM}  ───────────────────────────────────────${RESET}"
pause 0.5
slow_print "${RED}  1. FRONT-RUN:${RESET} Bob buys 10 SOL @ \$99.50"
echo -e "${DIM}     → Price moves to \$100.00${RESET}"
pause 0.5
slow_print "${RED}  2. VICTIM TX:${RESET} Alice buys 10 SOL @ \$100.00"
echo -e "${DIM}     → Price moves to \$100.50${RESET}"
pause 0.5
slow_print "${RED}  3. BACK-RUN:${RESET} Bob sells 10 SOL @ \$100.50"
echo -e "${DIM}     → Bob profits, Alice loses${RESET}"
echo ""

pause 1

slow_print "${YELLOW}[Step 5]${RESET} ${BOLD}Attack Results${RESET}"
echo ""
echo -e "${BG_RED}  ATTACK SUCCESSFUL  ${RESET}"
echo ""
echo -e "${RED}  Bob's Profit:   +\$10.00 (1% of trade)${RESET}"
echo -e "${RED}  Alice's Loss:   -\$10.00 (paid extra)${RESET}"
echo ""

pause 2

# Scenario 2: Dusk Exchange
echo -e "\n${CYAN}════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}${CYAN}  SCENARIO 2: Dusk Exchange (PROTECTED)${RESET}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${RESET}\n"

echo -e "${DIM}Dusk Exchange encrypts all order details using Arcium MPC.${RESET}"
echo -e "${DIM}Attackers cannot read order prices or amounts.${RESET}\n"

pause 1

slow_print "${YELLOW}[Step 1]${RESET} ${BOLD}Alice encrypts her order with Arcium MPC${RESET}"
slow_print "${GREEN}  [ALICE]${RESET} Encrypting order: 10 SOL @ \$100.00"
echo -e "${DIM}  Using X25519 key exchange + Rescue cipher${RESET}"
echo -e "${DIM}    Encrypted price: 7f3a9b2c...d8e19c2e${RESET}"
echo -e "${DIM}    Encrypted amount: 1b8df4a1...c7b3f4a1${RESET}"
echo ""

pause 1

slow_print "${YELLOW}[Step 2]${RESET} ${BOLD}Encrypted transaction enters mempool...${RESET}"
echo ""
echo -e "${CYAN}  ┌─────────────────────────────────────────────────────┐${RESET}"
echo -e "${CYAN}  │${RESET}  ${BOLD}MEMPOOL TRANSACTION${RESET}                                ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  ─────────────────────────────────────────────────  ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  Program: Dusk Exchange                              ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  Instruction: place_order                            ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  ${GREEN}Side: ???${RESET}                          ${GREEN}← ENCRYPTED${RESET}    ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  ${GREEN}Price: 0x7f3a...9c2e${RESET}              ${GREEN}← ENCRYPTED${RESET}    ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  ${GREEN}Amount: 0x1b8d...f4a1${RESET}             ${GREEN}← ENCRYPTED${RESET}    ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  Signer: Alice...abc123                              ${CYAN}│${RESET}"
echo -e "${CYAN}  └─────────────────────────────────────────────────────┘${RESET}"
echo ""

pause 1

slow_print "${YELLOW}[Step 3]${RESET} ${BOLD}Attacker Bob monitors mempool...${RESET}"
slow_print "${RED}  [ATTACKER]${RESET} Found a Dusk Exchange transaction!"
slow_print "${RED}  [ATTACKER]${RESET} Attempting to decode order details..."
echo ""

pause 0.5

echo -e "${RED}  ┌─────────────────────────────────────────────────────┐${RESET}"
echo -e "${RED}  │${RESET}  ${BOLD}ATTACKER ANALYSIS${RESET}                                    ${RED}│${RESET}"
echo -e "${RED}  │${RESET}  ─────────────────────────────────────────────────  ${RED}│${RESET}"
echo -e "${RED}  │${RESET}  Side:   ${DIM}Cannot determine (encrypted)${RESET}             ${RED}│${RESET}"
echo -e "${RED}  │${RESET}  Price:  ${DIM}Cannot determine (encrypted)${RESET}             ${RED}│${RESET}"
echo -e "${RED}  │${RESET}  Amount: ${DIM}Cannot determine (encrypted)${RESET}             ${RED}│${RESET}"
echo -e "${RED}  │${RESET}  ─────────────────────────────────────────────────  ${RED}│${RESET}"
echo -e "${RED}  │${RESET}  ${YELLOW}Encryption: Arcium MPC (Rescue cipher)${RESET}          ${RED}│${RESET}"
echo -e "${RED}  │${RESET}  ${YELLOW}Key holders: 3/4 MPC nodes required${RESET}             ${RED}│${RESET}"
echo -e "${RED}  └─────────────────────────────────────────────────────┘${RESET}"
echo ""

pause 1

slow_print "${YELLOW}[Step 4]${RESET} ${BOLD}Bob considers blind front-run...${RESET}"
slow_print "${RED}  [ATTACKER]${RESET} Can't see price... would have to guess"
slow_print "${RED}  [ATTACKER]${RESET} Risk: 10% potential loss per wrong guess"
slow_print "${RED}  [ATTACKER]${RESET} ${YELLOW}Decision: Too risky! Aborting attack.${RESET}"
echo ""

pause 1

slow_print "${YELLOW}[Step 5]${RESET} ${BOLD}Orders match fairly in MPC${RESET}"
slow_print "${GREEN}  [CAROL]${RESET} Submits encrypted sell: 10 SOL @ \$99.50"
echo ""
slow_print "${BLUE}  [SYSTEM]${RESET} Arcium MPC processes encrypted orderbook"
slow_print "${BLUE}  [SYSTEM]${RESET} Finding matches without revealing orders..."
echo ""

pause 0.5

echo -e "${CYAN}  ┌─────────────────────────────────────────────────────┐${RESET}"
echo -e "${CYAN}  │${RESET}  ${BOLD}MPC COMPUTATION RESULT${RESET}                              ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  ─────────────────────────────────────────────────  ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  Match found: YES                                   ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  Execution price: \$99.75 (midpoint)                 ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  Execution amount: 10 SOL                           ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  Buyer: Alice                                       ${CYAN}│${RESET}"
echo -e "${CYAN}  │${RESET}  Seller: Carol                                      ${CYAN}│${RESET}"
echo -e "${CYAN}  └─────────────────────────────────────────────────────┘${RESET}"
echo ""

pause 1

slow_print "${YELLOW}[Step 6]${RESET} ${BOLD}Trade Results${RESET}"
echo ""
echo -e "${BG_GREEN}  ATTACK PREVENTED  ${RESET}"
echo ""
echo -e "${GREEN}  Alice's Trade:  10 SOL @ \$99.75 (fair price!)${RESET}"
echo -e "${GREEN}  Carol's Trade:  10 SOL @ \$99.75 (fair price!)${RESET}"
echo -e "${GREEN}  Bob's Attack:   FAILED (couldn't read orders)${RESET}"
echo ""

pause 2

# Comparison
echo -e "\n${CYAN}════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}${CYAN}  MEV PROTECTION COMPARISON${RESET}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${RESET}\n"

echo -e "${BOLD}  Feature                    Traditional DEX    Dusk Exchange${RESET}"
echo -e "${DIM}  ─────────────────────────────────────────────────────────────${RESET}"
echo -e "  Order visibility          ${RED}Fully visible${RESET}      ${GREEN}Encrypted${RESET}"
echo -e "  Price readable            ${RED}Yes${RESET}                ${GREEN}No${RESET}"
echo -e "  Amount readable           ${RED}Yes${RESET}                ${GREEN}No${RESET}"
echo -e "  Sandwich attacks          ${RED}Possible${RESET}           ${GREEN}Impossible${RESET}"
echo -e "  Front-running             ${RED}Possible${RESET}           ${GREEN}Impossible${RESET}"
echo -e "  Fair execution            ${RED}No guarantee${RESET}       ${GREEN}Guaranteed${RESET}"
echo -e "  MEV extraction            ${RED}~1% per trade${RESET}      ${GREEN}0%${RESET}"
echo ""

pause 1

echo -e "${CYAN}  Technology Stack:${RESET}"
echo -e "${DIM}  ├─ Blockchain: Solana (high throughput, low fees)${RESET}"
echo -e "${DIM}  ├─ Privacy: Arcium MPC (threshold encryption)${RESET}"
echo -e "${DIM}  ├─ Cipher: Rescue (MPC-friendly)${RESET}"
echo -e "${DIM}  └─ Matching: Secure multi-party computation${RESET}"
echo ""

# Final
echo -e "${CYAN}════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}${CYAN}  DUSK EXCHANGE - Trade Without Fear${RESET}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${RESET}"
echo ""
echo -e "${DIM}  GitHub: github.com/dusk-exchange${RESET}"
echo -e "${DIM}  Built for Solana Privacy Hackathon 2026${RESET}"
echo ""
