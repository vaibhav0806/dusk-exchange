import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(
  value: number,
  decimals: number = 2,
  compact: boolean = false
): string {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: decimals,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPrice(value: number): string {
  return formatNumber(value, 2);
}

export function formatAmount(value: number, decimals: number = 4): string {
  return formatNumber(value, decimals);
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// Convert lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / 1e9;
}

// Convert SOL to lamports
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1e9);
}

// Convert smallest unit to display amount based on decimals
export function toDisplayAmount(amount: number, decimals: number): number {
  return amount / Math.pow(10, decimals);
}

// Convert display amount to smallest unit
export function toSmallestUnit(amount: number, decimals: number): number {
  return Math.floor(amount * Math.pow(10, decimals));
}
