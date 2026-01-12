"use client";

import { FC } from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn, formatNumber, formatPercentage } from "@/lib/utils";

interface MarketStatsProps {
  baseSymbol?: string;
  quoteSymbol?: string;
  lastPrice?: number;
  priceChange24h?: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
}

export const MarketStats: FC<MarketStatsProps> = ({
  baseSymbol = "SOL",
  quoteSymbol = "USDC",
  lastPrice = 103.52,
  priceChange24h = 2.34,
  high24h = 105.80,
  low24h = 99.25,
  volume24h = 1250000,
}) => {
  const isPositive = priceChange24h >= 0;
  const pricePosition = ((lastPrice - low24h) / (high24h - low24h)) * 100;

  return (
    <div className="glass-panel rounded-2xl px-6 py-4">
      <div className="flex flex-wrap items-center gap-8 lg:gap-12">
        {/* Pair & Price */}
        <div className="flex items-center gap-4">
          {/* Token icons */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-display font-bold text-sm shadow-elevation-2">
              S
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#2775CA] border-2 border-surface flex items-center justify-center text-white text-[8px] font-bold">
              $
            </div>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-text-primary tracking-tight">
              {baseSymbol}/{quoteSymbol}
            </h2>
            <p className="font-mono text-xs text-text-muted">Solana / USD Coin</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block divider-vertical h-10" />

        {/* Last Price */}
        <div className="stat-card">
          <p className="table-header mb-1">Last Price</p>
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-2xl font-semibold text-text-primary tracking-tight">
              ${formatNumber(lastPrice, 2)}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 font-mono text-sm font-medium",
                isPositive ? "text-success" : "text-danger"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {formatPercentage(priceChange24h)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block divider-vertical h-10" />

        {/* 24h High/Low */}
        <div className="hidden md:block">
          <p className="table-header mb-1.5">24h Range</p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-danger font-medium">
              ${formatNumber(low24h, 2)}
            </span>
            <div className="w-24 h-2 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
              <div
                className="h-full rounded-full bg-gradient-to-r from-danger via-text-tertiary to-success transition-all duration-500"
                style={{ width: `${pricePosition}%` }}
              />
            </div>
            <span className="font-mono text-sm text-success font-medium">
              ${formatNumber(high24h, 2)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block divider-vertical h-10" />

        {/* 24h Volume */}
        <div className="hidden lg:block stat-card">
          <p className="table-header mb-1 flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3" />
            24h Volume
          </p>
          <span className="font-mono text-lg font-semibold text-text-primary">
            ${formatNumber(volume24h, 0, true)}
          </span>
        </div>
      </div>
    </div>
  );
};
