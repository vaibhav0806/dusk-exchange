// Main client
export { DuskExchangeClient, createClient } from "./client";

// Types
export {
  Market,
  UserPosition,
  TradeSettlement,
  OrderSide,
  OrderParams,
  EncryptedOrderData,
  MatchResult,
  CreateMarketParams,
  DepositWithdrawParams,
  DuskExchangeConfig,
  MarketInitializedEvent,
  DepositedEvent,
  WithdrawnEvent,
  OrderPlacedEvent,
  OrderCancelledEvent,
  TradeExecutedEvent,
} from "./types";

// Encryption utilities
export {
  ArciumEncryption,
  MockArciumEncryption,
  encryptOrder,
  generateNonce,
  generateOrderId,
  splitPubkey,
  joinPubkey,
  bnToLeBytes,
  leBytesToBn,
} from "./encryption";

// Constants
export {
  DUSK_EXCHANGE_PROGRAM_ID,
  ARCIUM_PROGRAM_ID,
  MARKET_SEED,
  USER_POSITION_SEED,
  BASE_VAULT_SEED,
  QUOTE_VAULT_SEED,
  TRADE_SETTLEMENT_SEED,
  COMP_DEF_OFFSET_ADD_ORDER,
  COMP_DEF_OFFSET_REMOVE_ORDER,
  COMP_DEF_OFFSET_MATCH_BOOK,
  DEFAULT_FEE_RATE_BPS,
  MAX_FEE_RATE_BPS,
  ENCRYPTED_U64_SIZE,
  NONCE_SIZE,
} from "./constants";
