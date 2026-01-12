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
    <div className="card border-l-2 border-l-accent px-5 py-3.5">
      <div className="flex flex-wrap items-center gap-6 lg:gap-10">
        {/* Pair & Price */}
        <div className="flex items-center gap-3.5">
          {/* Token icons */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-semibold text-sm shadow-medium">
              S
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-[#2775CA] border-2 border-surface flex items-center justify-center text-white text-[8px] font-semibold">
              $
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary tracking-tight">
              {baseSymbol}/{quoteSymbol}
            </h2>
            <p className="text-[11px] text-text-muted">Solana / USD Coin</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-border-subtle" />

        {/* Last Price */}
        <div>
          <p className="table-header mb-0.5">Last Price</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl font-semibold text-text-primary tracking-tight">
              ${formatNumber(lastPrice, 2)}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 font-mono text-xs font-medium",
                isPositive ? "text-success" : "text-danger"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {formatPercentage(priceChange24h)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-border-subtle" />

        {/* 24h High/Low */}
        <div className="hidden md:block">
          <p className="table-header mb-1.5">24h Range</p>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs text-danger font-medium">
              ${formatNumber(low24h, 2)}
            </span>
            <div className="relative w-20 h-1.5 rounded-full bg-surface-elevated overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-danger via-text-tertiary to-success"
                style={{ width: `${pricePosition}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-text-primary border-2 border-surface shadow-sm"
                style={{ left: `calc(${pricePosition}% - 4px)` }}
              />
            </div>
            <span className="font-mono text-xs text-success font-medium">
              ${formatNumber(high24h, 2)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-8 bg-border-subtle" />

        {/* 24h Volume */}
        <div className="hidden lg:block">
          <p className="table-header mb-0.5 flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3" />
            24h Volume
          </p>
          <span className="font-mono text-base font-semibold text-text-primary">
            ${formatNumber(volume24h, 0, true)}
          </span>
        </div>
      </div>
    </div>
  );
};
