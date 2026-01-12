/**
 * Dusk Exchange SDK - Basic Usage Example
 *
 * This example demonstrates:
 * - Creating a market
 * - Depositing tokens
 * - Placing encrypted orders
 * - Withdrawing tokens
 */

import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint, mintTo, getAssociatedTokenAddress } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import {
  DuskExchangeClient,
  createClient,
  OrderSide,
  DUSK_EXCHANGE_PROGRAM_ID,
} from "../src";

// IDL would be loaded from file in production
import idl from "../../target/idl/dusk_exchange.json";

async function main() {
  // Connect to localnet
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  // Create a test wallet
  const payer = Keypair.generate();

  // Airdrop some SOL
  console.log("Requesting airdrop...");
  const airdropSig = await connection.requestAirdrop(
    payer.publicKey,
    10 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSig);
  console.log("Airdrop confirmed!");

  // Create the client
  const client = createClient(connection, payer);
  await client.initialize(idl as any);

  // Create token mints for testing
  console.log("\nCreating token mints...");
  const baseMint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    9 // SOL decimals
  );
  console.log("Base mint:", baseMint.toString());

  const quoteMint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    6 // USDC decimals
  );
  console.log("Quote mint:", quoteMint.toString());

  // Create a market
  console.log("\nCreating market...");
  const marketId = new BN(1);
  const marketPda = await client.createMarket({
    marketId,
    baseMint,
    quoteMint,
    feeRateBps: 30, // 0.3%
  });
  console.log("Market created:", marketPda.toString());

  // Get market info
  const market = await client.getMarket(marketPda);
  console.log("Market info:", {
    baseMint: market.baseMint.toString(),
    quoteMint: market.quoteMint.toString(),
    feeRateBps: market.feeRateBps,
    orderCount: market.orderCount.toString(),
  });

  // Mint some tokens to the user
  console.log("\nMinting tokens...");
  const userBaseAta = await getAssociatedTokenAddress(baseMint, payer.publicKey);
  const userQuoteAta = await getAssociatedTokenAddress(quoteMint, payer.publicKey);

  await client.ensureTokenAccount(baseMint);
  await client.ensureTokenAccount(quoteMint);

  await mintTo(connection, payer, baseMint, userBaseAta, payer, 100 * 10 ** 9);
  await mintTo(connection, payer, quoteMint, userQuoteAta, payer, 10000 * 10 ** 6);

  console.log("Minted 100 base tokens and 10,000 quote tokens");

  // Deposit tokens
  console.log("\nDepositing tokens...");
  const depositBaseTx = await client.deposit({
    market: marketPda,
    amount: new BN(10 * 10 ** 9), // 10 base tokens
    isBase: true,
  });
  console.log("Deposited base tokens, tx:", depositBaseTx);

  const depositQuoteTx = await client.deposit({
    market: marketPda,
    amount: new BN(1000 * 10 ** 6), // 1000 quote tokens
    isBase: false,
  });
  console.log("Deposited quote tokens, tx:", depositQuoteTx);

  // Check user position
  const position = await client.getUserPosition(marketPda);
  console.log("\nUser position:", {
    baseDeposited: position.baseDeposited.toString(),
    quoteDeposited: position.quoteDeposited.toString(),
    baseLocked: position.baseLocked.toString(),
    quoteLocked: position.quoteLocked.toString(),
  });

  // Place an encrypted order (mock - requires Arcium for real encryption)
  console.log("\nPlacing encrypted buy order...");
  const orderId = await client.placeOrder(marketPda, {
    price: new BN(100 * 10 ** 6), // $100
    amount: new BN(1 * 10 ** 9), // 1 SOL
    side: OrderSide.Buy,
  });
  console.log("Order placed with ID:", orderId.toString());

  // Withdraw some tokens
  console.log("\nWithdrawing tokens...");
  const withdrawTx = await client.withdraw({
    market: marketPda,
    amount: new BN(1 * 10 ** 9), // 1 base token
    isBase: true,
  });
  console.log("Withdrew base tokens, tx:", withdrawTx);

  // Final position
  const finalPosition = await client.getUserPosition(marketPda);
  console.log("\nFinal user position:", {
    baseDeposited: finalPosition.baseDeposited.toString(),
    quoteDeposited: finalPosition.quoteDeposited.toString(),
  });

  console.log("\n=== Example completed successfully! ===");
}

main().catch(console.error);
