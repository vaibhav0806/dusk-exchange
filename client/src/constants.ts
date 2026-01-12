import { PublicKey } from "@solana/web3.js";

// Program IDs
export const DUSK_EXCHANGE_PROGRAM_ID = new PublicKey(
  "7LyfNf3Q7weRFCA316BepiMGWkKVY5aE4xYPrNzSFTRQ"
);

export const ARCIUM_PROGRAM_ID = new PublicKey(
  "F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk"
);

// PDA Seeds
export const MARKET_SEED = Buffer.from("market");
export const USER_POSITION_SEED = Buffer.from("user_position");
export const BASE_VAULT_SEED = Buffer.from("base_vault");
export const QUOTE_VAULT_SEED = Buffer.from("quote_vault");
export const TRADE_SETTLEMENT_SEED = Buffer.from("trade_settlement");

// Arcium computation definition offsets
export const COMP_DEF_OFFSET_ADD_ORDER = 0;
export const COMP_DEF_OFFSET_REMOVE_ORDER = 1;
export const COMP_DEF_OFFSET_MATCH_BOOK = 2;

// Fee configuration
export const DEFAULT_FEE_RATE_BPS = 30; // 0.3%
export const MAX_FEE_RATE_BPS = 100; // 1%

// Encrypted data sizes
export const ENCRYPTED_U64_SIZE = 32;
export const NONCE_SIZE = 12;
