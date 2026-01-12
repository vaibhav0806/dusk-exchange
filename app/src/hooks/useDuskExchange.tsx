"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  FC,
  useMemo,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { Program, AnchorProvider, BN, Idl, Wallet } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount, createAssociatedTokenAccountInstruction } from "@solana/spl-token";

// IDL import - use require to avoid TypeScript module issues
const IDL = require("../../../target/idl/dusk_exchange.json");

// Types for the context
interface Market {
  pubkey: PublicKey;
  marketId: BN;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  authority: PublicKey;
  feeRateBps: number;
  totalBaseDeposited: BN;
  totalQuoteDeposited: BN;
}

interface UserPosition {
  market: PublicKey;
  owner: PublicKey;
  baseDeposited: BN;
  quoteDeposited: BN;
  baseLocked: BN;
  quoteLocked: BN;
}

interface Order {
  id: string;
  side: "buy" | "sell";
  price: number;
  amount: number;
  filled: number;
  status: "open" | "partial" | "filled" | "cancelled";
  timestamp: number;
}

interface DuskExchangeContextType {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  marketStatus: string; // Status message for UI

  // Market data
  currentMarket: Market | null;
  markets: Market[];

  // User data
  userPosition: UserPosition | null;
  userOrders: Order[];
  walletBalances: { base: number; quote: number };
  depositedBalances: { base: number; quote: number };

  // Actions
  refreshMarket: () => Promise<void>;
  refreshUserPosition: () => Promise<void>;
  deposit: (amount: number, isBase: boolean) => Promise<string>;
  withdraw: (amount: number, isBase: boolean) => Promise<string>;
  placeOrder: (side: "buy" | "sell", price: number, amount: number) => Promise<string>;
  cancelOrder: (orderId: string) => Promise<string>;
  requestAirdrop: () => Promise<string>;
}

const DuskExchangeContext = createContext<DuskExchangeContextType | null>(null);

// Well-known token mints for devnet
const DEVNET_SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // Devnet USDC

// Program ID - must match the deployed program
const DUSK_PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// PDA Seeds
const MARKET_SEED = Buffer.from("market");
const USER_POSITION_SEED = Buffer.from("user_position");
const BASE_VAULT_SEED = Buffer.from("base_vault");
const QUOTE_VAULT_SEED = Buffer.from("quote_vault");

interface DuskExchangeProviderProps {
  children: ReactNode;
  marketId?: number;
}
  
export const DuskExchangeProvider: FC<DuskExchangeProviderProps> = ({
  children,
  marketId = 1,
}) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketStatus, setMarketStatus] = useState<string>("Connecting...");
  const [currentMarket, setCurrentMarket] = useState<Market | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [walletBalances, setWalletBalances] = useState({ base: 0, quote: 0 });
  const [depositedBalances, setDepositedBalances] = useState({ base: 0, quote: 0 });

  // Create Anchor program instance
  const program = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    
    try {
      const provider = new AnchorProvider(
        connection,
        wallet as unknown as Wallet,
        { commitment: "confirmed" }
      );
      return new Program(IDL as Idl, provider);
    } catch (err) {
      console.error("Failed to create program:", err);
      return null;
    }
  }, [connection, wallet]);

  // Derive market PDA
  const deriveMarketPda = useCallback((id: number): PublicKey => {
    const marketIdBN = new BN(id);
    const [pda] = PublicKey.findProgramAddressSync(
      [MARKET_SEED, marketIdBN.toArrayLike(Buffer, "le", 8)],
      DUSK_PROGRAM_ID
    );
    return pda;
  }, []);

  // Derive user position PDA
  const deriveUserPositionPda = useCallback((market: PublicKey, user: PublicKey): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [USER_POSITION_SEED, market.toBuffer(), user.toBuffer()],
      DUSK_PROGRAM_ID
    );
    return pda;
  }, []);

  // Derive vault PDAs
  const deriveBaseVaultPda = useCallback((market: PublicKey): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [BASE_VAULT_SEED, market.toBuffer()],
      DUSK_PROGRAM_ID
    );
    return pda;
  }, []);

  const deriveQuoteVaultPda = useCallback((market: PublicKey): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [QUOTE_VAULT_SEED, market.toBuffer()],
      DUSK_PROGRAM_ID
    );
    return pda;
  }, []);

  // Fetch market data
  const refreshMarket = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMarketStatus("Connecting to localnet...");

      const marketPda = deriveMarketPda(marketId);

      if (program) {
        try {
          // Try to fetch market from the program
          const marketAccount = await (program.account as any).market.fetch(marketPda);
          
          const market: Market = {
            pubkey: marketPda,
            marketId: marketAccount.marketId,
            baseMint: marketAccount.baseMint,
            quoteMint: marketAccount.quoteMint,
            baseVault: marketAccount.baseVault,
            quoteVault: marketAccount.quoteVault,
            authority: marketAccount.authority,
            feeRateBps: marketAccount.feeRateBps,
            totalBaseDeposited: marketAccount.totalBaseDeposited,
            totalQuoteDeposited: marketAccount.totalQuoteDeposited,
          };
          
          setCurrentMarket(market);
          setMarkets([market]);
          setMarketStatus(`✓ Market loaded (${marketPda.toString().slice(0, 8)}...)`);
          console.log("Market loaded from chain:", market.pubkey.toString());
          console.log("Base mint:", market.baseMint.toString());
          console.log("Quote mint:", market.quoteMint.toString());
        } catch (fetchErr) {
          console.log("Market not found on-chain");
          setCurrentMarket(null);
          setMarketStatus("⚠ Market not found - run tests first");
        }
      } else {
        // No program available
        setCurrentMarket(null);
        setMarketStatus("⚠ Connect wallet to load market");
      }
    } catch (err) {
      console.error("Error fetching market:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch market");
      setMarketStatus("✗ Connection error");
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [connection, marketId, deriveMarketPda, program]);

  // Fetch user position and balances
  const refreshUserPosition = useCallback(async () => {
    if (!wallet.publicKey) {
      setUserPosition(null);
      setWalletBalances({ base: 0, quote: 0 });
      setDepositedBalances({ base: 0, quote: 0 });
      return;
    }

    try {
      // Get SOL balance
      const solBalance = await connection.getBalance(wallet.publicKey);
      const solAmount = solBalance / LAMPORTS_PER_SOL;

      setWalletBalances({
        base: solAmount,
        quote: 1000, // Mock USDC balance - in production would fetch from token account
      });

      // Try to fetch user position from chain
      const marketPda = deriveMarketPda(marketId);
      const positionPda = deriveUserPositionPda(marketPda, wallet.publicKey);

      if (program) {
        try {
          const positionAccount = await (program.account as any).userPosition.fetch(positionPda);
          
          const baseDeposited = positionAccount.baseDeposited.toNumber() / LAMPORTS_PER_SOL;
          const quoteDeposited = positionAccount.quoteDeposited.toNumber() / 1_000_000; // USDC has 6 decimals
          
          setDepositedBalances({
            base: baseDeposited,
            quote: quoteDeposited,
          });
          
          setUserPosition({
            market: marketPda,
            owner: wallet.publicKey,
            baseDeposited: positionAccount.baseDeposited,
            quoteDeposited: positionAccount.quoteDeposited,
            baseLocked: positionAccount.baseLocked,
            quoteLocked: positionAccount.quoteLocked,
          });
          
          console.log("User position loaded:", { baseDeposited, quoteDeposited });
        } catch (fetchErr) {
          // No position yet
          setDepositedBalances({ base: 0, quote: 0 });
          setUserPosition(null);
        }
      } else {
        setDepositedBalances({ base: 0, quote: 0 });
        setUserPosition(null);
      }
    } catch (err) {
      console.error("Error fetching user position:", err);
    }
  }, [connection, wallet.publicKey, marketId, deriveMarketPda, deriveUserPositionPda, program]);

  // Deposit tokens - REAL IMPLEMENTATION
  const deposit = useCallback(async (amount: number, isBase: boolean): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    if (!program) {
      throw new Error("Program not initialized");
    }

    if (!currentMarket) {
      throw new Error("Market not loaded. Please refresh.");
    }

    setIsLoading(true);
    setError(null);

    try {
      const marketPda = deriveMarketPda(marketId);
      const userPositionPda = deriveUserPositionPda(marketPda, wallet.publicKey);
      
      const mint = isBase ? currentMarket.baseMint : currentMarket.quoteMint;
      const vault = isBase ? currentMarket.baseVault : currentMarket.quoteVault;

      // Get user's token account
      const userTokenAccount = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey
      );

      // Convert amount to proper decimals
      const decimals = isBase ? 9 : 6; // SOL = 9, USDC = 6
      const amountBN = new BN(Math.floor(amount * Math.pow(10, decimals)));

      console.log(`Depositing ${amount} ${isBase ? "SOL" : "USDC"} (${amountBN.toString()} lamports)`);

      const tx = await program.methods
        .deposit(amountBN, isBase)
        .accountsPartial({
          user: wallet.publicKey,
          market: marketPda,
          userPosition: userPositionPda,
          userTokenAccount,
          vault,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Deposit transaction:", tx);

      // Refresh balances after deposit
      await refreshUserPosition();

      return tx;
    } catch (err) {
      console.error("Deposit error:", err);
      const message = err instanceof Error ? err.message : "Deposit failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wallet.signTransaction, program, currentMarket, marketId, deriveMarketPda, deriveUserPositionPda, refreshUserPosition]);

  // Withdraw tokens - REAL IMPLEMENTATION
  const withdraw = useCallback(async (amount: number, isBase: boolean): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    if (!program) {
      throw new Error("Program not initialized");
    }

    if (!currentMarket) {
      throw new Error("Market not loaded. Please refresh.");
    }

    setIsLoading(true);
    setError(null);

    try {
      const marketPda = deriveMarketPda(marketId);
      const userPositionPda = deriveUserPositionPda(marketPda, wallet.publicKey);
      
      const mint = isBase ? currentMarket.baseMint : currentMarket.quoteMint;
      const vault = isBase ? currentMarket.baseVault : currentMarket.quoteVault;

      const userTokenAccount = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey
      );

      // Convert amount to proper decimals
      const decimals = isBase ? 9 : 6;
      const amountBN = new BN(Math.floor(amount * Math.pow(10, decimals)));

      console.log(`Withdrawing ${amount} ${isBase ? "SOL" : "USDC"} (${amountBN.toString()} lamports)`);

      const tx = await program.methods
        .withdraw(amountBN, isBase)
        .accountsPartial({
          user: wallet.publicKey,
          market: marketPda,
          userPosition: userPositionPda,
          userTokenAccount,
          vault,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Withdraw transaction:", tx);

      // Refresh balances after withdraw
      await refreshUserPosition();

      return tx;
    } catch (err) {
      console.error("Withdraw error:", err);
      const message = err instanceof Error ? err.message : "Withdrawal failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wallet.signTransaction, program, currentMarket, marketId, deriveMarketPda, deriveUserPositionPda, refreshUserPosition]);

  // Place order (encrypted) - SIMULATED for now (requires Arcium MPC)
  const placeOrder = useCallback(async (
    side: "buy" | "sell",
    price: number,
    amount: number
  ): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Placing encrypted ${side} order: ${amount} @ ${price}`);
      console.log("Note: Full encrypted order placement requires Arcium MPC nodes");

      // Simulate encryption and transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add to local orders (simulated)
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        side,
        price,
        amount,
        filled: 0,
        status: "open",
        timestamp: Date.now(),
      };

      setUserOrders((prev: Order[]) => [newOrder, ...prev]);

      // Lock funds (simulated)
      if (side === "buy") {
        const lockAmount = price * amount;
        setDepositedBalances((prev: { base: number; quote: number }) => ({
          ...prev,
          quote: prev.quote - lockAmount,
        }));
      } else {
        setDepositedBalances((prev: { base: number; quote: number }) => ({
          ...prev,
          base: prev.base - amount,
        }));
      }

      return "simulated-order-" + newOrder.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Order failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wallet.signTransaction]);

  // Cancel order - SIMULATED for now
  const cancelOrder = useCallback(async (orderId: string): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Cancelling order: ${orderId}`);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find and update the order
      const order = userOrders.find((o: Order) => o.id === orderId);
      if (order) {
        // Unlock funds
        if (order.side === "buy") {
          const unlockAmount = order.price * (order.amount - order.filled);
          setDepositedBalances((prev: { base: number; quote: number }) => ({
            ...prev,
            quote: prev.quote + unlockAmount,
          }));
        } else {
          const unlockAmount = order.amount - order.filled;
          setDepositedBalances((prev: { base: number; quote: number }) => ({
            ...prev,
            base: prev.base + unlockAmount,
          }));
        }
      }

      setUserOrders((prev: Order[]) => prev.filter((o: Order) => o.id !== orderId));

      return "cancelled-" + orderId;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cancel failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wallet.signTransaction, userOrders]);

  // Request airdrop (localnet only)
  const requestAirdrop = useCallback(async (): Promise<string> => {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Requesting airdrop for:", wallet.publicKey.toString());
      
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        2 * LAMPORTS_PER_SOL // 2 SOL
      );
      
      await connection.confirmTransaction(signature, "confirmed");
      console.log("Airdrop successful:", signature);
      
      // Refresh balances
      await refreshUserPosition();
      
      return signature;
    } catch (err) {
      console.error("Airdrop error:", err);
      const message = err instanceof Error ? err.message : "Airdrop failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [connection, wallet.publicKey, refreshUserPosition]);

  // Initialize on mount and wallet change
  useEffect(() => {
    refreshMarket();
  }, [refreshMarket]);

  useEffect(() => {
    refreshUserPosition();
  }, [refreshUserPosition]);

  const value: DuskExchangeContextType = {
    isInitialized,
    isLoading,
    error,
    marketStatus,
    currentMarket,
    markets,
    userPosition,
    userOrders,
    walletBalances,
    depositedBalances,
    refreshMarket,
    refreshUserPosition,
    deposit,
    withdraw,
    placeOrder,
    cancelOrder,
    requestAirdrop,
  };

  return (
    <DuskExchangeContext.Provider value={value}>
      {children}
    </DuskExchangeContext.Provider>
  );
};

// Hook to use the context
export function useDuskExchange(): DuskExchangeContextType {
  const context = useContext(DuskExchangeContext);
  if (!context) {
    throw new Error("useDuskExchange must be used within a DuskExchangeProvider");
  }
  return context;
}

// Convenience hooks
export function useMarket() {
  const { currentMarket, markets, refreshMarket, isLoading } = useDuskExchange();
  return { market: currentMarket, markets, refresh: refreshMarket, isLoading };
}

export function useUserPosition() {
  const {
    userPosition,
    walletBalances,
    depositedBalances,
    refreshUserPosition,
    isLoading
  } = useDuskExchange();

  return {
    position: userPosition,
    walletBalances,
    depositedBalances,
    refresh: refreshUserPosition,
    isLoading
  };
}

export function useOrders() {
  const { userOrders, placeOrder, cancelOrder, isLoading, error } = useDuskExchange();
  return { orders: userOrders, placeOrder, cancelOrder, isLoading, error };
}

export function useDeposit() {
  const { deposit, withdraw, isLoading, error } = useDuskExchange();
  return { deposit, withdraw, isLoading, error };
}
