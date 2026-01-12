"use client";

import { FC, useMemo } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

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
      <div className="p-4 border-b border-dusk-800/50">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">
            Order Book
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-dusk-500">
              {baseSymbol}/{quoteSymbol}
            </span>
          </div>
        </div>
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
          Total
        </span>
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
        <div className="sticky top-0 z-10 py-3 px-4 bg-dusk-900/80 backdrop-blur-sm border-y border-dusk-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-semibold text-white">
                {formatNumber(lastPrice, 2)}
              </span>
              <span
                className={cn(
                  "font-mono text-sm",
                  priceChange >= 0 ? "text-bull-400" : "text-bear-400"
                )}
              >
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(2)}%
              </span>
            </div>
            <span className="font-mono text-xs text-dusk-500">Last Trade</span>
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
      <div className="p-3 border-t border-dusk-800/50 bg-dusk-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EyeOff className="h-3.5 w-3.5 text-cipher-500" />
            <span className="font-mono text-[10px] text-dusk-400">
              Encrypted orders hidden until match
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-cipher-500/50 animate-pulse" />
            <span className="font-mono text-[10px] text-dusk-500">Live</span>
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
      initial={{ opacity: 0, x: isBid ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="relative group data-row"
    >
      {/* Depth visualization */}
      <div
        className={cn(
          "absolute inset-y-0 transition-all duration-300",
          isBid ? "right-0 bg-bull-500/8" : "left-0 bg-bear-500/8"
        )}
        style={{ width: `${depthPercentage}%` }}
      />

      <div className="relative grid grid-cols-3 gap-2 px-4 py-1.5">
        {/* Price */}
        <span
          className={cn(
            "font-mono text-sm tabular-nums",
            isBid ? "text-bull-400" : "text-bear-400"
          )}
        >
          {formatNumber(entry.price, 2)}
        </span>

        {/* Amount */}
        <span className="font-mono text-sm tabular-nums text-dusk-300 text-right">
          {entry.isEncrypted ? (
            <span className="inline-flex items-center gap-1 text-dusk-500">
              <span className="encrypted-shimmer px-2 py-0.5 rounded bg-dusk-800/50">
                ••••
              </span>
            </span>
          ) : (
            formatNumber(entry.amount, 4)
          )}
        </span>

        {/* Total */}
        <span className="font-mono text-sm tabular-nums text-dusk-400 text-right">
          {entry.isEncrypted ? (
            <span className="text-dusk-600">—</span>
          ) : (
            formatNumber(entry.total, 2)
          )}
        </span>
      </div>
    </motion.div>
  );
};
