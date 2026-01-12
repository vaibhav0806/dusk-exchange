"use client";

import { FC, useMemo } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import { Shield, Activity } from "lucide-react";

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  isEncrypted?: boolean;
}

interface OrderBookProps {
  bids?: OrderBookEntry[];
  asks?: OrderBookEntry[];
  lastPrice?: number;
  priceChange?: number;
  baseSymbol?: string;
  quoteSymbol?: string;
}

// Generate mock encrypted orderbook data
const generateMockData = (): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } => {
  const midPrice = 103.5;
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];

  for (let i = 0; i < 8; i++) {
    const bidPrice = midPrice - (i + 1) * 0.25;
    const askPrice = midPrice + (i + 1) * 0.25;
    const bidAmount = Math.random() * 50 + 5;
    const askAmount = Math.random() * 50 + 5;

    bids.push({
      price: bidPrice,
      amount: bidAmount,
      total: bidPrice * bidAmount,
      isEncrypted: Math.random() > 0.3,
    });

    asks.push({
      price: askPrice,
      amount: askAmount,
      total: askPrice * askAmount,
      isEncrypted: Math.random() > 0.3,
    });
  }

  return { bids, asks: asks.reverse() };
};

export const OrderBook: FC<OrderBookProps> = ({
  bids: propBids,
  asks: propAsks,
  lastPrice = 103.5,
  priceChange = 2.34,
  baseSymbol = "SOL",
  quoteSymbol = "USDC",
}) => {
  const { bids, asks } = useMemo(() => {
    if (propBids && propAsks) {
      return { bids: propBids, asks: propAsks };
    }
    return generateMockData();
  }, [propBids, propAsks]);

  const maxTotal = useMemo(() => {
    const allTotals = [...bids, ...asks].map((o) => o.total);
    return Math.max(...allTotals);
  }, [bids, asks]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-text-primary">
            Order Book
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-tertiary">
              {baseSymbol}/{quoteSymbol}
            </span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent-subtle border border-accent/20">
              <Activity className="h-3 w-3 text-accent" />
              <span className="font-mono text-[10px] text-accent">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-5 py-2.5 bg-surface-elevated border-b border-border-subtle">
        <span className="table-header">Price ({quoteSymbol})</span>
        <span className="table-header text-right">Size ({baseSymbol})</span>
        <span className="table-header text-right">Total</span>
      </div>

      {/* Asks (Sells) - Red */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col-reverse">
          {asks.map((ask, i) => (
            <OrderRow
              key={`ask-${i}`}
              entry={ask}
              side="ask"
              maxTotal={maxTotal}
              index={i}
            />
          ))}
        </div>

        {/* Spread / Last Price */}
        <div className="sticky top-0 z-10 py-3 px-5 bg-surface/95 backdrop-blur-sm border-y border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-semibold text-text-primary">
                {formatNumber(lastPrice, 2)}
              </span>
              <span
                className={cn(
                  "font-mono text-sm font-medium",
                  priceChange >= 0 ? "text-success" : "text-danger"
                )}
              >
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(2)}%
              </span>
            </div>
            <span className="font-mono text-xs text-text-muted">Last Trade</span>
          </div>
        </div>

        {/* Bids (Buys) - Green */}
        <div>
          {bids.map((bid, i) => (
            <OrderRow
              key={`bid-${i}`}
              entry={bid}
              side="bid"
              maxTotal={maxTotal}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Footer - Privacy indicator */}
      <div className="px-5 py-3 border-t border-border-subtle bg-surface-elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono text-[10px] text-text-tertiary">
              Encrypted orders hidden until match
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual order row component
const OrderRow: FC<{
  entry: OrderBookEntry;
  side: "bid" | "ask";
  maxTotal: number;
  index: number;
}> = ({ entry, side, maxTotal, index }) => {
  const isBid = side === "bid";
  const depthPercentage = (entry.total / maxTotal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: isBid ? -8 : 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.015, duration: 0.2 }}
      className="relative group"
    >
      {/* Depth visualization */}
      <div
        className={cn(
          "absolute inset-y-0 transition-all duration-500 ease-out-expo",
          isBid
            ? "right-0 bg-gradient-to-l from-success/10 to-transparent"
            : "left-0 bg-gradient-to-r from-danger/10 to-transparent"
        )}
        style={{ width: `${depthPercentage}%` }}
      />

      <div className="relative grid grid-cols-3 gap-2 px-5 py-2 hover:bg-white/[0.02] transition-colors">
        {/* Price */}
        <span
          className={cn(
            "font-mono text-sm tabular-nums font-medium",
            isBid ? "text-success" : "text-danger"
          )}
        >
          {formatNumber(entry.price, 2)}
        </span>

        {/* Amount */}
        <span className="font-mono text-sm tabular-nums text-text-secondary text-right">
          {entry.isEncrypted ? (
            <span className="inline-flex items-center justify-end gap-1">
              <span className="encrypted-shimmer px-2 py-0.5 rounded text-text-muted">
                ••••
              </span>
            </span>
          ) : (
            formatNumber(entry.amount, 4)
          )}
        </span>

        {/* Total */}
        <span className="font-mono text-sm tabular-nums text-text-tertiary text-right">
          {entry.isEncrypted ? (
            <span className="text-text-muted">—</span>
          ) : (
            formatNumber(entry.total, 2)
          )}
        </span>
      </div>
    </motion.div>
  );
};
