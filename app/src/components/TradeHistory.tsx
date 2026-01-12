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
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="panel-header">
        <h2 className="panel-title">Recent Trades</h2>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-surface-elevated border-b border-border-subtle">
        <span className="table-header">Price</span>
        <span className="table-header text-right">Size</span>
        <span className="table-header text-right">Time</span>
      </div>

      {/* Trades List */}
      <div className="max-h-[200px] overflow-y-auto">
        {trades.map((trade, index) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.015, duration: 0.15 }}
            className="grid grid-cols-3 gap-2 px-4 py-1.5 data-row"
          >
            <span
              className={cn(
                "font-mono text-xs tabular-nums font-medium",
                trade.side === "buy" ? "text-success" : "text-danger"
              )}
            >
              {formatNumber(trade.price, 2)}
            </span>
            <span className="font-mono text-xs tabular-nums text-text-secondary text-right">
              {formatNumber(trade.amount, 4)}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-text-muted text-right">
              {formatTime(trade.timestamp)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
