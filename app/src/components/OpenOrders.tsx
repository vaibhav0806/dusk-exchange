"use client";

import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { X, Shield, Clock, ChevronDown, Loader2, Inbox } from "lucide-react";
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
      <div className="px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-text-primary">
            Open Orders
          </h2>
          <span className="badge">
            {orders.length} Active
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-h-[280px] overflow-y-auto">
        {!connected ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-elevated border border-border-subtle mb-3">
              <Shield className="h-5 w-5 text-text-muted" />
            </div>
            <p className="text-sm text-text-secondary">
              Connect wallet to view orders
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-elevated border border-border-subtle mb-3">
              <Inbox className="h-5 w-5 text-text-muted" />
            </div>
            <p className="text-sm text-text-secondary">No open orders</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="group"
                >
                  <div
                    className={cn(
                      "px-5 py-3 cursor-pointer transition-colors",
                      "hover:bg-white/[0.02]",
                      expandedOrder === order.id && "bg-surface-elevated"
                    )}
                    onClick={() =>
                      setExpandedOrder(expandedOrder === order.id ? null : order.id)
                    }
                  >
                    {/* Main Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
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
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-accent" />
                            <span className="font-mono text-sm text-text-secondary encrypted-shimmer px-1">
                              •••.••
                            </span>
                            <span className="text-text-muted">×</span>
                            <span className="font-mono text-sm text-text-secondary encrypted-shimmer px-1">
                              •.••••
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-text-muted" />
                            <span className="font-mono text-[10px] text-text-muted">
                              {formatTime(order.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Expand */}
                      <div className="flex items-center gap-3">
                        <div className="badge badge-accent flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                          <span>Encrypted</span>
                        </div>

                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-text-muted transition-transform",
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
                          <div className="pt-4 mt-4 border-t border-border-subtle">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <span className="table-header">Order ID</span>
                                <p className="font-mono text-xs text-text-secondary mt-1">
                                  {order.id}
                                </p>
                              </div>
                              <div>
                                <span className="table-header">Total Value</span>
                                <p className="font-mono text-xs text-text-secondary mt-1">
                                  <span className="text-accent">Encrypted</span>
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(order.id);
                              }}
                              disabled={cancellingId === order.id}
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-danger-subtle border border-danger/20 text-danger text-sm font-medium hover:bg-danger/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
