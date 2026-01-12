"use client";

import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { X, Lock, Clock, ChevronDown, Loader2, Inbox } from "lucide-react";
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
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="panel-header">
        <h2 className="panel-title">Open Orders</h2>
        <span className="badge">{orders.length} Active</span>
      </div>

      {/* Orders List */}
      <div className="max-h-[260px] overflow-y-auto">
        {!connected ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-elevated border border-border-subtle mb-2.5">
              <Lock className="h-4 w-4 text-text-muted" />
            </div>
            <p className="text-xs text-text-secondary">
              Connect wallet to view orders
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-elevated border border-border-subtle mb-2.5">
              <Inbox className="h-4 w-4 text-text-muted" />
            </div>
            <p className="text-xs text-text-secondary">No open orders</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ delay: index * 0.02 }}
                  className="group"
                >
                  <div
                    className={cn(
                      "px-4 py-2.5 cursor-pointer transition-colors data-row",
                      expandedOrder === order.id && "bg-surface-elevated"
                    )}
                    onClick={() =>
                      setExpandedOrder(expandedOrder === order.id ? null : order.id)
                    }
                  >
                    {/* Main Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {/* Side Badge */}
                        <div
                          className={cn(
                            "badge",
                            order.side === "buy" ? "badge-success" : "badge-danger"
                          )}
                        >
                          {order.side}
                        </div>

                        {/* Price & Amount - Encrypted */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Lock className="h-2.5 w-2.5 text-accent" />
                            <span className="font-mono text-xs text-text-secondary encrypted-display">
                              ***.**
                            </span>
                            <span className="text-text-muted text-[10px]">x</span>
                            <span className="font-mono text-xs text-text-secondary encrypted-display">
                              *.****
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-2.5 w-2.5 text-text-muted" />
                            <span className="font-mono text-[10px] text-text-muted">
                              {formatTime(order.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Expand */}
                      <div className="flex items-center gap-2">
                        <div className="badge badge-accent flex items-center gap-1">
                          <span className="status-dot bg-accent status-dot-pulse" />
                          <span>Private</span>
                        </div>

                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 text-text-muted transition-transform",
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
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 mt-3 border-t border-border-subtle">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <span className="table-header">Order ID</span>
                                <p className="font-mono text-[10px] text-text-secondary mt-0.5 truncate">
                                  {order.id}
                                </p>
                              </div>
                              <div>
                                <span className="table-header">Total Value</span>
                                <p className="font-mono text-[10px] text-accent mt-0.5">
                                  Encrypted
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(order.id);
                              }}
                              disabled={cancellingId === order.id}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-danger-subtle border border-danger/20 text-danger text-xs font-medium hover:bg-danger/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingId === order.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3" />
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
