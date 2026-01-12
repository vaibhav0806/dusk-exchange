"use client";

import { FC } from "react";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
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

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-6 lg:gap-10">
        {/* Pair & Price */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-bold">
                S
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#2775CA] border-2 border-dusk-950 flex items-center justify-center text-white text-[8px] font-bold">
                $
              </div>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-white">
                {baseSymbol}/{quoteSymbol}
              </h2>
              <p className="font-mono text-xs text-dusk-400">Solana / USD Coin</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-10 w-px bg-dusk-700" />

        {/* Last Price */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-dusk-500 mb-1">
            Last Price
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-white">
              ${formatNumber(lastPrice, 2)}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 font-mono text-sm",
                isPositive ? "text-bull-400" : "text-bear-400"
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
        <div className="hidden md:block h-10 w-px bg-dusk-700" />

        {/* 24h High/Low */}
        <div className="hidden md:block">
          <p className="text-[10px] uppercase tracking-wider text-dusk-500 mb-1">
            24h Range
          </p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-bear-400">
              ${formatNumber(low24h, 2)}
            </span>
            <div className="w-20 h-1.5 rounded-full bg-dusk-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-bear-500 via-dusk-400 to-bull-500"
                style={{
                  width: `${((lastPrice - low24h) / (high24h - low24h)) * 100}%`,
                }}
              />
            </div>
            <span className="font-mono text-sm text-bull-400">
              ${formatNumber(high24h, 2)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block h-10 w-px bg-dusk-700" />

        {/* 24h Volume */}
        <div className="hidden lg:block">
          <p className="text-[10px] uppercase tracking-wider text-dusk-500 mb-1 flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            24h Volume
          </p>
          <span className="font-mono text-lg text-white">
            ${formatNumber(volume24h, 0, true)}
          </span>
        </div>

        {/* Live Indicator */}
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-dusk-900 border border-dusk-700">
          <Activity className="h-3.5 w-3.5 text-cipher-500" />
          <span className="font-mono text-xs text-dusk-300">Live</span>
          <div className="h-2 w-2 rounded-full bg-cipher-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
