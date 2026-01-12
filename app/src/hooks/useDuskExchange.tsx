"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  FC,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import BN from "bn.js";

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
}

const DuskExchangeContext = createContext<DuskExchangeContextType | null>(null);

// Well-known token mints for devnet
const DEVNET_SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // Devnet USDC

// Program ID
const DUSK_PROGRAM_ID = new PublicKey("7LyfNf3Q7weRFCA316BepiMGWkKVY5aE4xYPrNzSFTRQ");

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
  const [currentMarket, setCurrentMarket] = useState<Market | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [walletBalances, setWalletBalances] = useState({ base: 0, quote: 0 });
  const [depositedBalances, setDepositedBalances] = useState({ base: 0, quote: 0 });

  // Derive market PDA
  const deriveMarketPda = useCallback((id: number): PublicKey => {
    const marketIdBN = new BN(id);
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), marketIdBN.toArrayLike(Buffer, "le", 8)],
      DUSK_PROGRAM_ID
    );
    return pda;
  }, []);

  // Derive user position PDA
  const deriveUserPositionPda = useCallback((market: PublicKey, user: PublicKey): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_position"), market.toBuffer(), user.toBuffer()],
      DUSK_PROGRAM_ID
    );
    return pda;
  }, []);

  // Fetch market data
  const refreshMarket = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const marketPda = deriveMarketPda(marketId);

      // Try to fetch market account
      const accountInfo = await connection.getAccountInfo(marketPda);

      if (accountInfo) {
        // Parse market data (simplified - in production use Anchor's coder)
        // For now, create mock market data since parsing requires IDL
        const mockMarket: Market = {
          pubkey: marketPda,
          marketId: new BN(marketId),
          baseMint: DEVNET_SOL_MINT,
          quoteMint: DEVNET_USDC_MINT,
          baseVault: deriveMarketPda(marketId), // Simplified
          quoteVault: deriveMarketPda(marketId), // Simplified
          authority: wallet.publicKey || PublicKey.default,
          feeRateBps: 30,
          totalBaseDeposited: new BN(0),
          totalQuoteDeposited: new BN(0),
        };
        setCurrentMarket(mockMarket);
        setMarkets([mockMarket]);
      } else {
        // Market doesn't exist yet - use defaults
        console.log("Market not found on-chain, using defaults");
        setCurrentMarket(null);
      }
    } catch (err) {
      console.error("Error fetching market:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch market");
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [connection, marketId, deriveMarketPda, wallet.publicKey]);

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

      // For demo purposes, we'll use mock deposited balances
      // In production, this would fetch from the user position account
      setWalletBalances({
        base: solAmount,
        quote: 1000, // Mock USDC balance
      });

      // Try to fetch user position from chain
      const marketPda = deriveMarketPda(marketId);
      const positionPda = deriveUserPositionPda(marketPda, wallet.publicKey);
      const positionAccount = await connection.getAccountInfo(positionPda);

      if (positionAccount) {
        // Parse position data - simplified for demo
        setDepositedBalances({
          base: 0,
          quote: 0,
        });
        setUserPosition({
          market: marketPda,
          owner: wallet.publicKey,
          baseDeposited: new BN(0),
          quoteDeposited: new BN(0),
          baseLocked: new BN(0),
          quoteLocked: new BN(0),
        });
      } else {
        // No position yet
        setDepositedBalances({ base: 0, quote: 0 });
        setUserPosition(null);
      }
    } catch (err) {
      console.error("Error fetching user position:", err);
    }
  }, [connection, wallet.publicKey, marketId, deriveMarketPda, deriveUserPositionPda]);

  // Deposit tokens
  const deposit = useCallback(async (amount: number, isBase: boolean): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      // For demo, just log the action
      // In production, this would call the SDK
      console.log(`Depositing ${amount} ${isBase ? "SOL" : "USDC"}`);

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local state optimistically
      setDepositedBalances(prev => ({
        ...prev,
        [isBase ? "base" : "quote"]: prev[isBase ? "base" : "quote"] + amount,
      }));

      setWalletBalances(prev => ({
        ...prev,
        [isBase ? "base" : "quote"]: prev[isBase ? "base" : "quote"] - amount,
      }));

      return "mock-deposit-signature";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Deposit failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wallet.signTransaction]);

  // Withdraw tokens
  const withdraw = useCallback(async (amount: number, isBase: boolean): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Withdrawing ${amount} ${isBase ? "SOL" : "USDC"}`);

      await new Promise(resolve => setTimeout(resolve, 1500));

      setDepositedBalances(prev => ({
        ...prev,
        [isBase ? "base" : "quote"]: prev[isBase ? "base" : "quote"] - amount,
      }));

      setWalletBalances(prev => ({
        ...prev,
        [isBase ? "base" : "quote"]: prev[isBase ? "base" : "quote"] + amount,
      }));

      return "mock-withdraw-signature";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Withdrawal failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wallet.signTransaction]);

  // Place order (encrypted)
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

      // Simulate encryption and transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add to local orders
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        side,
        price,
        amount,
        filled: 0,
        status: "open",
        timestamp: Date.now(),
      };

      setUserOrders(prev => [newOrder, ...prev]);

      // Lock funds
      if (side === "buy") {
        const lockAmount = price * amount;
        setDepositedBalances(prev => ({
          ...prev,
          quote: prev.quote - lockAmount,
        }));
      } else {
        setDepositedBalances(prev => ({
          ...prev,
          base: prev.base - amount,
        }));
      }

      return "mock-order-signature";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Order failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wallet.signTransaction]);

  // Cancel order
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
      const order = userOrders.find(o => o.id === orderId);
      if (order) {
        // Unlock funds
        if (order.side === "buy") {
          const unlockAmount = order.price * (order.amount - order.filled);
          setDepositedBalances(prev => ({
            ...prev,
            quote: prev.quote + unlockAmount,
          }));
        } else {
          const unlockAmount = order.amount - order.filled;
          setDepositedBalances(prev => ({
            ...prev,
            base: prev.base + unlockAmount,
          }));
        }
      }

      setUserOrders(prev => prev.filter(o => o.id !== orderId));

      return "mock-cancel-signature";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cancel failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wallet.signTransaction, userOrders]);

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
