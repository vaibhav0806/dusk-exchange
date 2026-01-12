import { PublicKey, Keypair } from "@solana/web3.js";
import BN from "bn.js";
import { ENCRYPTED_U64_SIZE, NONCE_SIZE } from "./constants";
import { EncryptedOrderData, OrderParams, OrderSide } from "./types";

/**
 * Encryption utilities for Arcium MPC
 *
 * In production, this uses Arcium's encryption scheme:
 * - X25519 key exchange to derive shared secret
 * - Rescue cipher for symmetric encryption
 *
 * For development/testing, we provide mock encryption.
 */

/**
 * Generate a random nonce for encryption
 */
export function generateNonce(): Uint8Array {
  const nonce = new Uint8Array(NONCE_SIZE);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(nonce);
  } else {
    // Node.js fallback
    const { randomBytes } = require("crypto");
    const bytes = randomBytes(NONCE_SIZE);
    nonce.set(bytes);
  }
  return nonce;
}

/**
 * Convert a BN to a fixed-size little-endian byte array
 */
export function bnToLeBytes(value: BN, size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  const arr = value.toArray("le", size);
  bytes.set(arr);
  return bytes;
}

/**
 * Convert a little-endian byte array to BN
 */
export function leBytesToBn(bytes: Uint8Array): BN {
  return new BN(bytes, "le");
}

/**
 * Split a PublicKey into two u128 values (for Arcium compatibility)
 */
export function splitPubkey(pubkey: PublicKey): { lo: BN; hi: BN } {
  const bytes = pubkey.toBytes();
  const lo = new BN(bytes.slice(0, 16), "le");
  const hi = new BN(bytes.slice(16, 32), "le");
  return { lo, hi };
}

/**
 * Reconstruct a PublicKey from two u128 values
 */
export function joinPubkey(lo: BN, hi: BN): PublicKey {
  const loBytes = lo.toArray("le", 16);
  const hiBytes = hi.toArray("le", 16);
  const bytes = new Uint8Array(32);
  bytes.set(loBytes, 0);
  bytes.set(hiBytes, 16);
  return new PublicKey(bytes);
}

/**
 * Mock encryption for development/testing
 * In production, this would use Arcium's actual encryption
 */
export function mockEncryptU64(value: BN, nonce: Uint8Array): Uint8Array {
  // For mock: just pad the value to 32 bytes with nonce prefix
  // Real implementation uses Rescue cipher with shared secret
  const encrypted = new Uint8Array(ENCRYPTED_U64_SIZE);
  const valueBytes = bnToLeBytes(value, 8);

  // Simple XOR with nonce-derived key (NOT cryptographically secure - mock only)
  for (let i = 0; i < 8; i++) {
    encrypted[i] = valueBytes[i] ^ nonce[i % NONCE_SIZE];
  }
  // Fill rest with randomness
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(encrypted.subarray(8));
  }
  return encrypted;
}

/**
 * Mock decryption for development/testing
 */
export function mockDecryptU64(
  encrypted: Uint8Array,
  nonce: Uint8Array
): BN {
  const valueBytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    valueBytes[i] = encrypted[i] ^ nonce[i % NONCE_SIZE];
  }
  return leBytesToBn(valueBytes);
}

/**
 * Arcium encryption interface
 * Uses @arcium-hq/client in production
 */
export interface ArciumEncryption {
  /**
   * Initialize encryption with MXE public key
   */
  init(mxePublicKey: Uint8Array): Promise<void>;

  /**
   * Encrypt a u64 value
   */
  encryptU64(value: BN, nonce: Uint8Array): Promise<Uint8Array>;

  /**
   * Decrypt a u64 value (only works for shared encryption)
   */
  decryptU64(encrypted: Uint8Array, nonce: Uint8Array): Promise<BN>;
}

/**
 * Mock Arcium encryption for development
 */
export class MockArciumEncryption implements ArciumEncryption {
  private initialized = false;

  async init(_mxePublicKey: Uint8Array): Promise<void> {
    this.initialized = true;
  }

  async encryptU64(value: BN, nonce: Uint8Array): Promise<Uint8Array> {
    if (!this.initialized) {
      throw new Error("Encryption not initialized");
    }
    return mockEncryptU64(value, nonce);
  }

  async decryptU64(encrypted: Uint8Array, nonce: Uint8Array): Promise<BN> {
    if (!this.initialized) {
      throw new Error("Encryption not initialized");
    }
    return mockDecryptU64(encrypted, nonce);
  }
}

/**
 * Encrypt order parameters for submission
 */
export async function encryptOrder(
  params: OrderParams,
  encryption: ArciumEncryption
): Promise<EncryptedOrderData> {
  const nonce = generateNonce();
  const encryptedPrice = await encryption.encryptU64(params.price, nonce);
  const encryptedAmount = await encryption.encryptU64(params.amount, nonce);

  return {
    encryptedPrice,
    encryptedAmount,
    nonce,
  };
}

/**
 * Generate a unique order ID
 */
export function generateOrderId(): BN {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    const { randomBytes } = require("crypto");
    bytes.set(randomBytes(8));
  }
  return leBytesToBn(bytes);
}
