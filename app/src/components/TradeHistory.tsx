"use client";

import { FC } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";

interface Trade {
  id: string;
  price: number;
  amount: number;
  side: "buy" | "sell";
  timestamp: number;
}

interface TradeHistoryProps {
  trades?: Trade[];
  baseSymbol?: string;
  quoteSymbol?: string;
}

// Mock recent trades
const mockTrades: Trade[] = [
  { id: "1", price: 103.52, amount: 2.5, side: "buy", timestamp: Date.now() - 5000 },
  { id: "2", price: 103.48, amount: 1.2, side: "sell", timestamp: Date.now() - 15000 },
  { id: "3", price: 103.55, amount: 5.0, side: "buy", timestamp: Date.now() - 30000 },
  { id: "4", price: 103.45, amount: 3.3, side: "sell", timestamp: Date.now() - 45000 },
  { id: "5", price: 103.50, amount: 0.8, side: "buy", timestamp: Date.now() - 60000 },
  { id: "6", price: 103.42, amount: 4.2, side: "sell", timestamp: Date.now() - 90000 },
  { id: "7", price: 103.58, amount: 1.5, side: "buy", timestamp: Date.now() - 120000 },
  { id: "8", price: 103.40, amount: 2.0, side: "sell", timestamp: Date.now() - 150000 },
];

export const TradeHistory: FC<TradeHistoryProps> = ({
  trades = mockTrades,
  baseSymbol = "SOL",
  quoteSymbol = "USDC",
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-dusk-800/50">
        <h2 className="font-display text-lg font-semibold text-white">
          Recent Trades
        </h2>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-dusk-900/30 border-b border-dusk-800/50">
        <span className="font-mono text-[10px] uppercase tracking-wider text-dusk-500">
          Price ({quoteSymbol})
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-dusk-500 text-right">
          Amount ({baseSymbol})
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-dusk-500 text-right">
          Time
        </span>
      </div>

      {/* Trades List */}
      <div className="max-h-[250px] overflow-y-auto">
        {trades.map((trade, index) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="grid grid-cols-3 gap-2 px-4 py-2 data-row"
          >
            <span
              className={cn(
                "font-mono text-sm tabular-nums",
                trade.side === "buy" ? "text-bull-400" : "text-bear-400"
              )}
            >
              {formatNumber(trade.price, 2)}
            </span>
            <span className="font-mono text-sm tabular-nums text-dusk-300 text-right">
              {formatNumber(trade.amount, 4)}
            </span>
            <span className="font-mono text-xs tabular-nums text-dusk-500 text-right">
              {formatTime(trade.timestamp)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
