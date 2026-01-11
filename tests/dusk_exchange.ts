import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { expect } from "chai";
import { DuskExchange } from "../target/types/dusk_exchange";

describe("dusk_exchange", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.DuskExchange as Program<DuskExchange>;

  // Test accounts
  let authority: Keypair;
  let user1: Keypair;
  let user2: Keypair;

  // Token mints
  let baseMint: PublicKey; // wSOL-like
  let quoteMint: PublicKey; // USDC-like

  // User token accounts
  let user1BaseAccount: PublicKey;
  let user1QuoteAccount: PublicKey;
  let user2BaseAccount: PublicKey;
  let user2QuoteAccount: PublicKey;

  // Market accounts
  let marketPda: PublicKey;
  let marketBump: number;
  let baseVaultPda: PublicKey;
  let quoteVaultPda: PublicKey;

  const MARKET_ID = new anchor.BN(1);
  const FEE_RATE_BPS = 30; // 0.3%

  // Price scale: 10^6 (so $100 = 100_000_000)
  const PRICE_SCALE = 1_000_000;

  before(async () => {
    // Generate keypairs
    authority = Keypair.generate();
    user1 = Keypair.generate();
    user2 = Keypair.generate();

    // Airdrop SOL to all accounts
    const airdropPromises = [authority, user1, user2].map(async (kp) => {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        10 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);
    });
    await Promise.all(airdropPromises);

    // Create token mints
    baseMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      9 // 9 decimals like SOL
    );

    quoteMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      6 // 6 decimals like USDC
    );

    // Create user token accounts
    user1BaseAccount = await createAccount(
      provider.connection,
      user1,
      baseMint,
      user1.publicKey
    );

    user1QuoteAccount = await createAccount(
      provider.connection,
      user1,
      quoteMint,
      user1.publicKey
    );

    user2BaseAccount = await createAccount(
      provider.connection,
      user2,
      baseMint,
      user2.publicKey
    );

    user2QuoteAccount = await createAccount(
      provider.connection,
      user2,
      quoteMint,
      user2.publicKey
    );

    // Mint tokens to users
    // User1: 100 SOL equivalent
    await mintTo(
      provider.connection,
      authority,
      baseMint,
      user1BaseAccount,
      authority,
      100 * 10 ** 9 // 100 tokens with 9 decimals
    );

    // User1: 10,000 USDC equivalent
    await mintTo(
      provider.connection,
      authority,
      quoteMint,
      user1QuoteAccount,
      authority,
      10_000 * 10 ** 6 // 10,000 tokens with 6 decimals
    );

    // User2: 100 SOL equivalent
    await mintTo(
      provider.connection,
      authority,
      baseMint,
      user2BaseAccount,
      authority,
      100 * 10 ** 9
    );

    // User2: 10,000 USDC equivalent
    await mintTo(
      provider.connection,
      authority,
      quoteMint,
      user2QuoteAccount,
      authority,
      10_000 * 10 ** 6
    );

    // Derive market PDA
    [marketPda, marketBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), MARKET_ID.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Derive vault PDAs
    [baseVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("base_vault"), marketPda.toBuffer()],
      program.programId
    );

    [quoteVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("quote_vault"), marketPda.toBuffer()],
      program.programId
    );
  });

  describe("Market Initialization", () => {
    it("initializes a new market", async () => {
      const tx = await program.methods
        .initializeMarket(MARKET_ID, FEE_RATE_BPS)
        .accounts({
          authority: authority.publicKey,
          market: marketPda,
          baseMint,
          quoteMint,
          baseVault: baseVaultPda,
          quoteVault: quoteVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([authority])
        .rpc();

      console.log("Initialize market tx:", tx);

      // Verify market account
      const marketAccount = await program.account.market.fetch(marketPda);
      expect(marketAccount.authority.toString()).to.equal(
        authority.publicKey.toString()
      );
      expect(marketAccount.baseMint.toString()).to.equal(baseMint.toString());
      expect(marketAccount.quoteMint.toString()).to.equal(quoteMint.toString());
      expect(marketAccount.marketId.toNumber()).to.equal(MARKET_ID.toNumber());
      expect(marketAccount.feeRateBps).to.equal(FEE_RATE_BPS);
      expect(marketAccount.orderCount.toNumber()).to.equal(0);
    });
  });

  describe("Deposits", () => {
    it("user1 deposits base tokens (SOL)", async () => {
      const depositAmount = new anchor.BN(10 * 10 ** 9); // 10 SOL

      // Derive user position PDA
      const [userPositionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user_position"),
          marketPda.toBuffer(),
          user1.publicKey.toBuffer(),
        ],
        program.programId
      );

      const tx = await program.methods
        .deposit(depositAmount, true) // true = base token
        .accounts({
          user: user1.publicKey,
          market: marketPda,
          userPosition: userPositionPda,
          userTokenAccount: user1BaseAccount,
          vault: baseVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      console.log("Deposit base tx:", tx);

      // Verify user position
      const position = await program.account.userPosition.fetch(userPositionPda);
      expect(position.baseDeposited.toNumber()).to.equal(depositAmount.toNumber());
      expect(position.quoteDeposited.toNumber()).to.equal(0);

      // Verify vault balance
      const vaultAccount = await getAccount(provider.connection, baseVaultPda);
      expect(Number(vaultAccount.amount)).to.equal(depositAmount.toNumber());
    });

    it("user1 deposits quote tokens (USDC)", async () => {
      const depositAmount = new anchor.BN(1000 * 10 ** 6); // 1000 USDC

      const [userPositionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user_position"),
          marketPda.toBuffer(),
          user1.publicKey.toBuffer(),
        ],
        program.programId
      );

      const tx = await program.methods
        .deposit(depositAmount, false) // false = quote token
        .accounts({
          user: user1.publicKey,
          market: marketPda,
          userPosition: userPositionPda,
          userTokenAccount: user1QuoteAccount,
          vault: quoteVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      console.log("Deposit quote tx:", tx);

      // Verify user position
      const position = await program.account.userPosition.fetch(userPositionPda);
      expect(position.quoteDeposited.toNumber()).to.equal(depositAmount.toNumber());

      // Verify vault balance
      const vaultAccount = await getAccount(provider.connection, quoteVaultPda);
      expect(Number(vaultAccount.amount)).to.equal(depositAmount.toNumber());
    });

    it("user2 deposits tokens", async () => {
      const baseAmount = new anchor.BN(10 * 10 ** 9); // 10 SOL
      const quoteAmount = new anchor.BN(1000 * 10 ** 6); // 1000 USDC

      const [userPositionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user_position"),
          marketPda.toBuffer(),
          user2.publicKey.toBuffer(),
        ],
        program.programId
      );

      // Deposit base
      await program.methods
        .deposit(baseAmount, true)
        .accounts({
          user: user2.publicKey,
          market: marketPda,
          userPosition: userPositionPda,
          userTokenAccount: user2BaseAccount,
          vault: baseVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      // Deposit quote
      await program.methods
        .deposit(quoteAmount, false)
        .accounts({
          user: user2.publicKey,
          market: marketPda,
          userPosition: userPositionPda,
          userTokenAccount: user2QuoteAccount,
          vault: quoteVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      // Verify user position
      const position = await program.account.userPosition.fetch(userPositionPda);
      expect(position.baseDeposited.toNumber()).to.equal(baseAmount.toNumber());
      expect(position.quoteDeposited.toNumber()).to.equal(quoteAmount.toNumber());
    });
  });

  describe("Withdrawals", () => {
    it("user1 withdraws some base tokens", async () => {
      const withdrawAmount = new anchor.BN(1 * 10 ** 9); // 1 SOL

      const [userPositionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user_position"),
          marketPda.toBuffer(),
          user1.publicKey.toBuffer(),
        ],
        program.programId
      );

      // Get initial balances
      const initialPosition = await program.account.userPosition.fetch(
        userPositionPda
      );
      const initialUserBalance = await getAccount(
        provider.connection,
        user1BaseAccount
      );

      const tx = await program.methods
        .withdraw(withdrawAmount, true) // true = base token
        .accounts({
          user: user1.publicKey,
          market: marketPda,
          userPosition: userPositionPda,
          userTokenAccount: user1BaseAccount,
          vault: baseVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();

      console.log("Withdraw tx:", tx);

      // Verify updated position
      const finalPosition = await program.account.userPosition.fetch(
        userPositionPda
      );
      expect(finalPosition.baseDeposited.toNumber()).to.equal(
        initialPosition.baseDeposited.toNumber() - withdrawAmount.toNumber()
      );

      // Verify user received tokens
      const finalUserBalance = await getAccount(
        provider.connection,
        user1BaseAccount
      );
      expect(Number(finalUserBalance.amount)).to.equal(
        Number(initialUserBalance.amount) + withdrawAmount.toNumber()
      );
    });

    it("fails to withdraw more than available balance", async () => {
      const [userPositionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user_position"),
          marketPda.toBuffer(),
          user1.publicKey.toBuffer(),
        ],
        program.programId
      );

      const position = await program.account.userPosition.fetch(userPositionPda);
      const tooMuch = position.baseDeposited.add(new anchor.BN(1));

      try {
        await program.methods
          .withdraw(tooMuch, true)
          .accounts({
            user: user1.publicKey,
            market: marketPda,
            userPosition: userPositionPda,
            userTokenAccount: user1BaseAccount,
            vault: baseVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user1])
          .rpc();

        expect.fail("Should have thrown InsufficientBalance error");
      } catch (error: any) {
        expect(error.error.errorCode.code).to.equal("InsufficientBalance");
      }
    });
  });

  // Note: Order placement and matching tests require Arcium integration
  // These would be implemented once Arcium testnet is connected
  describe("Order Placement (requires Arcium)", () => {
    it.skip("places an encrypted buy order", async () => {
      // TODO: Implement with Arcium encryption
      // 1. Encrypt order price and amount using Arcium client SDK
      // 2. Call placeOrder with encrypted data
      // 3. Wait for computation callback
    });

    it.skip("places an encrypted sell order", async () => {
      // TODO: Implement with Arcium encryption
    });
  });

  describe("Order Matching (requires Arcium)", () => {
    it.skip("matches crossing orders", async () => {
      // TODO: Implement with Arcium
      // 1. Place buy order at $101
      // 2. Place sell order at $100
      // 3. Call matchOrders
      // 4. Verify execution at midpoint (~$100.50)
    });

    it.skip("does not match non-crossing orders", async () => {
      // TODO: Implement with Arcium
      // Buy at $99, Sell at $101 - should not match
    });
  });

  describe("Trade Settlement", () => {
    it.skip("settles a matched trade", async () => {
      // TODO: Implement after matching works
      // 1. Have a matched trade in settlement account
      // 2. Call settleTrade
      // 3. Verify token transfers
    });
  });
});
