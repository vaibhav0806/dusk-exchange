import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Commitment,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { Program, AnchorProvider, Wallet, BN, Idl } from "@coral-xyz/anchor";
import {
  DUSK_EXCHANGE_PROGRAM_ID,
  ARCIUM_PROGRAM_ID,
  MARKET_SEED,
  USER_POSITION_SEED,
  BASE_VAULT_SEED,
  QUOTE_VAULT_SEED,
  DEFAULT_FEE_RATE_BPS,
} from "./constants";
import {
  Market,
  UserPosition,
  CreateMarketParams,
  DepositWithdrawParams,
  OrderParams,
  OrderSide,
  DuskExchangeConfig,
  EncryptedOrderData,
} from "./types";
import {
  ArciumEncryption,
  MockArciumEncryption,
  encryptOrder,
  generateOrderId,
  splitPubkey,
} from "./encryption";

// Import IDL types
import type { DuskExchange } from "./idl";

/**
 * DuskExchangeClient - Main SDK for interacting with Dusk Exchange
 *
 * @example
 * ```typescript
 * const client = new DuskExchangeClient(connection, wallet);
 *
 * // Create a market
 * const marketId = await client.createMarket({
 *   marketId: new BN(1),
 *   baseMint: SOL_MINT,
 *   quoteMint: USDC_MINT,
 * });
 *
 * // Deposit tokens
 * await client.deposit({
 *   market: marketPda,
 *   amount: new BN(10 * LAMPORTS_PER_SOL),
 *   isBase: true,
 * });
 *
 * // Place an encrypted order
 * const orderId = await client.placeOrder(marketPda, {
 *   price: new BN(100_000_000), // $100
 *   amount: new BN(1_000_000_000), // 1 SOL
 *   side: OrderSide.Buy,
 * });
 * ```
 */
export class DuskExchangeClient {
  public readonly connection: Connection;
  public readonly wallet: Wallet;
  public readonly programId: PublicKey;
  public readonly arciumProgramId: PublicKey;
  private program: Program<DuskExchange> | null = null;
  private encryption: ArciumEncryption;
  private clusterOffset: number;

  constructor(
    connection: Connection,
    wallet: Wallet,
    config: DuskExchangeConfig = {}
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = config.programId ?? DUSK_EXCHANGE_PROGRAM_ID;
    this.arciumProgramId = config.arciumProgramId ?? ARCIUM_PROGRAM_ID;
    this.clusterOffset = config.clusterOffset ?? 0;

    // Use mock encryption by default (real Arcium encryption requires MXE setup)
    this.encryption = new MockArciumEncryption();
  }

  /**
   * Initialize the client with program IDL
   */
  async initialize(idl: Idl): Promise<void> {
    const provider = new AnchorProvider(this.connection, this.wallet, {
      commitment: "confirmed",
    });
    this.program = new Program(idl, provider) as unknown as Program<DuskExchange>;

    // Initialize mock encryption
    await this.encryption.init(new Uint8Array(32));
  }

  /**
   * Set custom encryption implementation (for Arcium production use)
   */
  setEncryption(encryption: ArciumEncryption): void {
    this.encryption = encryption;
  }

  // ============================================================
  // PDA Derivation
  // ============================================================

  /**
   * Derive market PDA from market ID
   */
  deriveMarketPda(marketId: BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [MARKET_SEED, marketId.toArrayLike(Buffer, "le", 8)],
      this.programId
    );
  }

  /**
   * Derive user position PDA
   */
  deriveUserPositionPda(market: PublicKey, user: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [USER_POSITION_SEED, market.toBuffer(), user.toBuffer()],
      this.programId
    );
  }

  /**
   * Derive base vault PDA
   */
  deriveBaseVaultPda(market: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [BASE_VAULT_SEED, market.toBuffer()],
      this.programId
    );
  }

  /**
   * Derive quote vault PDA
   */
  deriveQuoteVaultPda(market: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [QUOTE_VAULT_SEED, market.toBuffer()],
      this.programId
    );
  }

  // ============================================================
  // Market Operations
  // ============================================================

  /**
   * Create a new trading market
   */
  async createMarket(params: CreateMarketParams): Promise<PublicKey> {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const [marketPda] = this.deriveMarketPda(params.marketId);
    const [baseVaultPda] = this.deriveBaseVaultPda(marketPda);
    const [quoteVaultPda] = this.deriveQuoteVaultPda(marketPda);

    const feeRateBps = params.feeRateBps ?? DEFAULT_FEE_RATE_BPS;

    await this.program.methods
      .initializeMarket(params.marketId, feeRateBps)
      .accountsPartial({
        authority: this.wallet.publicKey,
        market: marketPda,
        baseMint: params.baseMint,
        quoteMint: params.quoteMint,
        baseVault: baseVaultPda,
        quoteVault: quoteVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return marketPda;
  }

  /**
   * Get market account data
   */
  async getMarket(marketPda: PublicKey): Promise<Market> {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const account = await this.program.account.market.fetch(marketPda);
    return account as unknown as Market;
  }

  /**
   * Get market by ID
   */
  async getMarketById(marketId: BN): Promise<Market> {
    const [marketPda] = this.deriveMarketPda(marketId);
    return this.getMarket(marketPda);
  }

  /**
   * Get all markets (fetches all market accounts)
   */
  async getAllMarkets(): Promise<{ pubkey: PublicKey; account: Market }[]> {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const accounts = await this.program.account.market.all();
    return accounts.map((a) => ({
      pubkey: a.publicKey,
      account: a.account as unknown as Market,
    }));
  }

  // ============================================================
  // User Position Operations
  // ============================================================

  /**
   * Get user position for a market
   */
  async getUserPosition(market: PublicKey, user?: PublicKey): Promise<UserPosition> {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const userPubkey = user ?? this.wallet.publicKey;
    const [positionPda] = this.deriveUserPositionPda(market, userPubkey);

    const account = await this.program.account.userPosition.fetch(positionPda);
    return account as unknown as UserPosition;
  }

  /**
   * Deposit tokens into a market
   */
  async deposit(params: DepositWithdrawParams): Promise<string> {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const market = await this.getMarket(params.market);
    const [userPositionPda] = this.deriveUserPositionPda(
      params.market,
      this.wallet.publicKey
    );

    const mint = params.isBase ? market.baseMint : market.quoteMint;
    const vault = params.isBase ? market.baseVault : market.quoteVault;

    // Get user's token account
    const userTokenAccount = await getAssociatedTokenAddress(
      mint,
      this.wallet.publicKey
    );

    const tx = await this.program.methods
      .deposit(params.amount, params.isBase)
      .accountsPartial({
        user: this.wallet.publicKey,
        market: params.market,
        userPosition: userPositionPda,
        userTokenAccount,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Withdraw tokens from a market
   */
  async withdraw(params: DepositWithdrawParams): Promise<string> {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const market = await this.getMarket(params.market);
    const [userPositionPda] = this.deriveUserPositionPda(
      params.market,
      this.wallet.publicKey
    );

    const mint = params.isBase ? market.baseMint : market.quoteMint;
    const vault = params.isBase ? market.baseVault : market.quoteVault;

    const userTokenAccount = await getAssociatedTokenAddress(
      mint,
      this.wallet.publicKey
    );

    const tx = await this.program.methods
      .withdraw(params.amount, params.isBase)
      .accountsPartial({
        user: this.wallet.publicKey,
        market: params.market,
        userPosition: userPositionPda,
        userTokenAccount,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  /**
   * Get available balance (deposited - locked)
   */
  async getAvailableBalance(
    market: PublicKey,
    isBase: boolean,
    user?: PublicKey
  ): Promise<BN> {
    const position = await this.getUserPosition(market, user);
    if (isBase) {
      return position.baseDeposited.sub(position.baseLocked);
    }
    return position.quoteDeposited.sub(position.quoteLocked);
  }

  // ============================================================
  // Order Operations (Encrypted)
  // ============================================================

  /**
   * Place an encrypted limit order
   *
   * @param market - Market PDA
   * @param params - Order parameters (price, amount, side)
   * @returns Order ID
   */
  async placeOrder(market: PublicKey, params: OrderParams): Promise<BN> {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const orderId = generateOrderId();
    const isBuy = params.side === OrderSide.Buy;

    // Encrypt order data
    const encryptedData = await encryptOrder(params, this.encryption);

    const [userPositionPda] = this.deriveUserPositionPda(
      market,
      this.wallet.publicKey
    );

    // Note: Full Arcium integration requires additional accounts
    // This is a simplified version for the SDK structure
    console.log("Placing encrypted order:", {
      orderId: orderId.toString(),
      isBuy,
      encryptedPriceLen: encryptedData.encryptedPrice.length,
      encryptedAmountLen: encryptedData.encryptedAmount.length,
    });

    // TODO: Full implementation requires Arcium account setup
    // await this.program.methods
    //   .placeOrder(
    //     orderId,
    //     isBuy,
    //     Buffer.from(encryptedData.encryptedPrice),
    //     Buffer.from(encryptedData.encryptedAmount),
    //     Array.from(encryptedData.nonce)
    //   )
    //   .accounts({...})
    //   .rpc();

    return orderId;
  }

  /**
   * Cancel an existing order
   */
  async cancelOrder(market: PublicKey, orderId: BN): Promise<string> {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const [userPositionPda] = this.deriveUserPositionPda(
      market,
      this.wallet.publicKey
    );

    console.log("Cancelling order:", orderId.toString());

    // TODO: Full implementation requires Arcium account setup
    // await this.program.methods
    //   .cancelOrder(orderId)
    //   .accounts({...})
    //   .rpc();

    return "mock-tx-signature";
  }

  // ============================================================
  // Matching Operations
  // ============================================================

  /**
   * Trigger order matching for a market
   * This queues a match_book computation in the MPC network
   */
  async matchOrders(market: PublicKey): Promise<string> {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    console.log("Matching orders on market:", market.toString());

    // TODO: Full implementation requires Arcium account setup
    // await this.program.methods
    //   .matchOrders()
    //   .accounts({...})
    //   .rpc();

    return "mock-tx-signature";
  }

  /**
   * Settle a matched trade
   */
  async settleTrade(settlementPda: PublicKey): Promise<string> {
    if (!this.program) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    // TODO: Implement trade settlement
    console.log("Settling trade:", settlementPda.toString());

    return "mock-tx-signature";
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * Check if user has a token account, create if not
   */
  async ensureTokenAccount(mint: PublicKey): Promise<PublicKey> {
    const ata = await getAssociatedTokenAddress(mint, this.wallet.publicKey);

    try {
      await getAccount(this.connection, ata);
    } catch {
      // Account doesn't exist, create it
      const ix = createAssociatedTokenAccountInstruction(
        this.wallet.publicKey,
        ata,
        this.wallet.publicKey,
        mint
      );
      const tx = new Transaction().add(ix);
      await this.connection.sendTransaction(tx, []);
    }

    return ata;
  }

  /**
   * Get token balance
   */
  async getTokenBalance(mint: PublicKey, owner?: PublicKey): Promise<BN> {
    const ownerPubkey = owner ?? this.wallet.publicKey;
    const ata = await getAssociatedTokenAddress(mint, ownerPubkey);

    try {
      const account = await getAccount(this.connection, ata);
      return new BN(account.amount.toString());
    } catch {
      return new BN(0);
    }
  }

  /**
   * Airdrop SOL (devnet/localnet only)
   */
  async airdrop(amount: number): Promise<string> {
    const sig = await this.connection.requestAirdrop(
      this.wallet.publicKey,
      amount
    );
    await this.connection.confirmTransaction(sig);
    return sig;
  }
}

/**
 * Create a DuskExchangeClient from a Connection and Keypair
 */
export function createClient(
  connection: Connection,
  payer: Keypair,
  config?: DuskExchangeConfig
): DuskExchangeClient {
  const wallet = {
    publicKey: payer.publicKey,
    signTransaction: async (tx: Transaction) => {
      tx.sign(payer);
      return tx;
    },
    signAllTransactions: async (txs: Transaction[]) => {
      txs.forEach((tx) => tx.sign(payer));
      return txs;
    },
  } as Wallet;

  return new DuskExchangeClient(connection, wallet, config);
}
