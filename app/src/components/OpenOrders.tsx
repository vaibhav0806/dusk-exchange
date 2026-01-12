"use client";

import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { X, Lock, Clock, ChevronDown, Loader2 } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useOrders } from "@/hooks";

interface OpenOrdersProps {
  baseSymbol?: string;
  quoteSymbol?: string;
}

export const OpenOrders: FC<OpenOrdersProps> = ({
  baseSymbol = "SOL",
  quoteSymbol = "USDC",
}) => {
  const { connected } = useWallet();
  const { orders, cancelOrder, isLoading } = useOrders();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
    } finally {
      setCancellingId(null);
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-dusk-800/50">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">
            Open Orders
          </h2>
          <span className="font-mono text-xs px-2 py-1 rounded bg-dusk-800 text-dusk-400">
            {orders.length} Active
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-h-[300px] overflow-y-auto">
        {!connected ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-dusk-900 border border-dusk-700 mb-3">
              <Lock className="h-5 w-5 text-dusk-500" />
            </div>
            <p className="text-sm text-dusk-400">
              Connect wallet to view orders
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-dusk-400">No open orders</p>
          </div>
        ) : (
          <div className="divide-y divide-dusk-800/30">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div
                    className={cn(
                      "p-4 cursor-pointer transition-colors",
                      "hover:bg-dusk-900/30",
                      expandedOrder === order.id && "bg-dusk-900/50"
                    )}
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.id ? null : order.id
                      )
                    }
                  >
                    {/* Main Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Side Badge */}
                        <div
                          className={cn(
                            "px-2 py-1 rounded text-xs font-display font-medium uppercase",
                            order.side === "buy"
                              ? "bg-bull-glow text-bull-400 border border-bull-500/20"
                              : "bg-bear-glow text-bear-400 border border-bear-500/20"
                          )}
                        >
                          {order.side}
                        </div>

                        {/* Price & Amount */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-dusk-300 flex items-center gap-1.5">
                              <Lock className="h-3 w-3 text-cipher-500" />
                              <span className="encrypted-shimmer px-1">
                                •••.••
                              </span>
                            </span>
                            <span className="text-dusk-600">×</span>
                            <span className="font-mono text-sm text-dusk-300 encrypted-shimmer px-1">
                              •.••••
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-dusk-500" />
                            <span className="font-mono text-[10px] text-dusk-500">
                              {formatTime(order.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3">
                        {/* Status */}
                        <div
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-full",
                            order.status === "open" &&
                              "bg-cipher-glow border border-cipher-500/20",
                            order.status === "partial" &&
                              "bg-bull-glow/50 border border-bull-500/20"
                          )}
                        >
                          {order.status === "open" && (
                            <>
                              <div className="h-1.5 w-1.5 rounded-full bg-cipher-500 animate-pulse" />
                              <span className="font-mono text-[10px] text-cipher-400">
                                Encrypted
                              </span>
                            </>
                          )}
                          {order.status === "partial" && (
                            <>
                              <div className="h-1.5 w-1.5 rounded-full bg-bull-400" />
                              <span className="font-mono text-[10px] text-bull-400">
                                {Math.round((order.filled / order.amount) * 100)}
                                % Filled
                              </span>
                            </>
                          )}
                        </div>

                        {/* Expand Icon */}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-dusk-500 transition-transform",
                            expandedOrder === order.id && "rotate-180"
                          )}
                        />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t border-dusk-800/50">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-dusk-500">
                                  Order ID
                                </span>
                                <p className="font-mono text-xs text-dusk-300 mt-1">
                                  {order.id}
                                </p>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-dusk-500">
                                  Total Value
                                </span>
                                <p className="font-mono text-xs text-dusk-300 mt-1">
                                  <span className="text-cipher-400">
                                    Encrypted
                                  </span>
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(order.id);
                              }}
                              disabled={cancellingId === order.id}
                              className={cn(
                                "w-full flex items-center justify-center gap-2",
                                "py-2 rounded-lg",
                                "bg-bear-500/10 border border-bear-500/20",
                                "text-bear-400 text-sm font-medium",
                                "hover:bg-bear-500/20 transition-colors",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                              )}
                            >
                              {cancellingId === order.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <X className="h-4 w-4" />
                                  Cancel Order
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
