"use client";

import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Shield, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useOrders, useUserPosition } from "@/hooks";

type OrderSide = "buy" | "sell";

interface OrderFormProps {
  baseSymbol?: string;
  quoteSymbol?: string;
}

export const OrderForm: FC<OrderFormProps> = ({
  baseSymbol = "SOL",
  quoteSymbol = "USDC",
}) => {
  const { connected } = useWallet();
  const { placeOrder, isLoading: isOrderLoading, error: orderError } = useOrders();
  const { depositedBalances } = useUserPosition();

  const [side, setSide] = useState<OrderSide>("buy");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const baseBalance = depositedBalances.base;
  const quoteBalance = depositedBalances.quote;

  const total = parseFloat(price || "0") * parseFloat(amount || "0");
  const isBuy = side === "buy";

  const handleSubmit = async () => {
    if (!price || !amount || !connected) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      await placeOrder(side, parseFloat(price), parseFloat(amount));
      setSuccessMessage(`Order placed successfully`);
      setPrice("");
      setAmount("");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Order failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    const balance = isBuy ? quoteBalance : baseBalance;
    if (isBuy && price) {
      const maxAmount = (balance * percentage) / parseFloat(price);
      setAmount(maxAmount.toFixed(4));
    } else {
      setAmount((balance * percentage).toFixed(4));
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-text-primary">
            Place Order
          </h2>
          <div className="badge badge-accent flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            <span>Encrypted</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Buy/Sell Toggle */}
        <div className="relative flex p-1 bg-surface-elevated rounded-xl border border-border-subtle">
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg"
            animate={{
              x: isBuy ? 0 : "calc(100% + 4px)",
              backgroundColor: isBuy ? "hsl(145 63% 49% / 0.15)" : "hsl(0 84% 60% / 0.15)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button
            onClick={() => setSide("buy")}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-medium text-sm transition-colors",
              isBuy ? "text-success" : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            <TrendingUp className="h-4 w-4" />
            Buy
          </button>
          <button
            onClick={() => setSide("sell")}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-medium text-sm transition-colors",
              !isBuy ? "text-danger" : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            <TrendingDown className="h-4 w-4" />
            Sell
          </button>
        </div>

        {/* Price Input */}
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Price</span>
            <span className="font-mono text-xs text-text-muted">{quoteSymbol}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full h-12 px-4 pr-16 rounded-xl input-premium font-mono text-lg text-text-primary placeholder:text-text-muted"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="font-mono text-xs text-text-tertiary px-2 py-1 rounded bg-surface-elevated border border-border-subtle">
                {quoteSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Amount</span>
            <span className="font-mono text-xs text-text-muted">
              Avail: {formatNumber(isBuy ? quoteBalance : baseBalance, 4)} {isBuy ? quoteSymbol : baseSymbol}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0000"
              className="w-full h-12 px-4 pr-16 rounded-xl input-premium font-mono text-lg text-text-primary placeholder:text-text-muted"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="font-mono text-xs text-text-tertiary px-2 py-1 rounded bg-surface-elevated border border-border-subtle">
                {baseSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Percentage Buttons */}
        <div className="flex gap-2">
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <button
              key={pct}
              onClick={() => handlePercentageClick(pct)}
              className="flex-1 py-2 rounded-lg bg-surface-elevated border border-border-subtle font-mono text-xs text-text-secondary hover:text-accent hover:border-accent/30 transition-all duration-200"
            >
              {pct * 100}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Total</span>
            <div className="text-right">
              <span className="font-mono text-lg font-semibold text-text-primary">
                {formatNumber(total, 2)}
              </span>
              <span className="ml-1.5 font-mono text-sm text-text-tertiary">
                {quoteSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <AnimatePresence mode="wait">
          {!connected ? (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-surface-elevated border border-border-subtle"
            >
              <AlertCircle className="h-5 w-5 text-text-tertiary" />
              <span className="text-sm text-text-secondary">
                Connect wallet to trade
              </span>
            </motion.div>
          ) : (
            <motion.button
              key="submit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onClick={handleSubmit}
              disabled={!price || !amount || isSubmitting}
              className={cn(
                "w-full h-12 rounded-xl font-display font-semibold text-sm",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isBuy
                  ? "bg-gradient-to-r from-success to-success-muted text-white hover:shadow-glow-success"
                  : "bg-gradient-to-r from-danger to-danger-muted text-white hover:shadow-glow-danger"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Encrypting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  {isBuy ? "Buy" : "Sell"} {baseSymbol}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-success-subtle border border-success/20"
            >
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm text-success">{successMessage}</span>
            </motion.div>
          )}
          {orderError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-danger-subtle border border-danger/20"
            >
              <AlertCircle className="h-4 w-4 text-danger" />
              <span className="text-sm text-danger">{orderError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy Notice */}
        <div className="pt-3 border-t border-border-subtle">
          <p className="text-xs text-text-muted leading-relaxed">
            Orders are encrypted using Arcium MPC. Price and amount remain hidden from attackers until execution.
          </p>
        </div>
      </div>
    </div>
  );
};
