import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

/**
 * Market account data
 */
export interface Market {
  authority: PublicKey;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  marketId: BN;
  feeRateBps: number;
  orderCount: BN;
  activeBids: BN;
  activeAsks: BN;
  totalVolume: BN;
  bump: number;
}

/**
 * User position account data
 */
export interface UserPosition {
  owner: PublicKey;
  market: PublicKey;
  baseDeposited: BN;
  quoteDeposited: BN;
  baseLocked: BN;
  quoteLocked: BN;
  activeOrderCount: number;
  bump: number;
}

/**
 * Trade settlement account data
 */
export interface TradeSettlement {
  market: PublicKey;
  maker: PublicKey;
  taker: PublicKey;
  executionPrice: BN;
  executionAmount: BN;
  makerIsBuy: boolean;
  settled: boolean;
  timestamp: BN;
  bump: number;
}

/**
 * Order side enum
 */
export enum OrderSide {
  Buy = "buy",
  Sell = "sell",
}

/**
 * Order parameters for placing a new order
 */
export interface OrderParams {
  price: BN;
  amount: BN;
  side: OrderSide;
}

/**
 * Encrypted order data ready to submit
 */
export interface EncryptedOrderData {
  encryptedPrice: Uint8Array;
  encryptedAmount: Uint8Array;
  nonce: Uint8Array;
}

/**
 * Match result returned from matching computation
 */
export interface MatchResult {
  matched: boolean;
  makerOrderId: BN;
  takerOrderId: BN;
  executionPrice: BN;
  executionAmount: BN;
  makerOwnerLo: BN;
  makerOwnerHi: BN;
  takerOwnerLo: BN;
  takerOwnerHi: BN;
}

/**
 * Market creation parameters
 */
export interface CreateMarketParams {
  marketId: BN;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  feeRateBps?: number;
}

/**
 * Deposit/withdraw parameters
 */
export interface DepositWithdrawParams {
  market: PublicKey;
  amount: BN;
  isBase: boolean;
}

/**
 * Configuration for the DuskExchangeClient
 */
export interface DuskExchangeConfig {
  programId?: PublicKey;
  arciumProgramId?: PublicKey;
  clusterOffset?: number;
}

/**
 * Event types emitted by the program
 */
export interface MarketInitializedEvent {
  market: PublicKey;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  authority: PublicKey;
}

export interface DepositedEvent {
  market: PublicKey;
  user: PublicKey;
  amount: BN;
  isBase: boolean;
}

export interface WithdrawnEvent {
  market: PublicKey;
  user: PublicKey;
  amount: BN;
  isBase: boolean;
}

export interface OrderPlacedEvent {
  market: PublicKey;
  user: PublicKey;
  orderId: BN;
  isBuy: boolean;
  timestamp: BN;
}

export interface OrderCancelledEvent {
  market: PublicKey;
  user: PublicKey;
  orderId: BN;
  timestamp: BN;
}

export interface TradeExecutedEvent {
  market: PublicKey;
  maker: PublicKey;
  taker: PublicKey;
  executionPrice: BN;
  executionAmount: BN;
  timestamp: BN;
}
