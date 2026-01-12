"use client";

import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Lock, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
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
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="panel-header">
        <h2 className="panel-title">Place Order</h2>
        <div className="badge badge-warning flex items-center gap-1">
          <AlertCircle className="h-2.5 w-2.5" />
          <span>Simulated</span>
        </div>
      </div>
      
      {/* Simulation Warning */}
      <div className="mx-4 mt-3 p-2.5 rounded-lg bg-warning/10 border border-warning/20">
        <p className="text-[10px] text-warning leading-relaxed">
          <strong>Demo Mode:</strong> Order placement is simulated. 
          Real encrypted orders require Arcium MPC nodes which are not running.
          Deposit/Withdraw are real on-chain transactions.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Buy/Sell Toggle */}
        <div className="relative flex p-0.5 bg-surface-elevated rounded-lg">
          <motion.div
            className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md"
            animate={{
              x: isBuy ? 0 : "calc(100% + 2px)",
              backgroundColor: isBuy
                ? "hsl(152 60% 48% / 0.15)"
                : "hsl(0 72% 58% / 0.15)",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
          <button
            onClick={() => setSide("buy")}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-medium text-sm transition-colors",
              isBuy ? "text-success" : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Buy
          </button>
          <button
            onClick={() => setSide("sell")}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-medium text-sm transition-colors",
              !isBuy ? "text-danger" : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            Sell
          </button>
        </div>

        {/* Price Input */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Price</span>
            <span className="font-mono text-[10px] text-text-muted">{quoteSymbol}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full h-10 px-3 pr-14 rounded-lg input-field font-mono text-sm text-text-primary placeholder:text-text-muted"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <span className="font-mono text-[10px] text-text-tertiary px-1.5 py-0.5 rounded bg-surface-elevated">
                {quoteSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Amount</span>
            <span className="font-mono text-[10px] text-text-muted">
              Avail: {formatNumber(isBuy ? quoteBalance : baseBalance, 2)} {isBuy ? quoteSymbol : baseSymbol}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0000"
              className="w-full h-10 px-3 pr-14 rounded-lg input-field font-mono text-sm text-text-primary placeholder:text-text-muted"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <span className="font-mono text-[10px] text-text-tertiary px-1.5 py-0.5 rounded bg-surface-elevated">
                {baseSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Percentage Buttons */}
        <div className="flex gap-1.5">
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <button
              key={pct}
              onClick={() => handlePercentageClick(pct)}
              className="flex-1 py-1.5 rounded-md bg-surface-elevated border border-border-subtle font-mono text-[10px] text-text-secondary hover:text-accent hover:border-accent/30 transition-all"
            >
              {pct * 100}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Total</span>
            <div className="text-right">
              <span className="font-mono text-base font-semibold text-text-primary">
                {formatNumber(total, 2)}
              </span>
              <span className="ml-1 font-mono text-xs text-text-tertiary">
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
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-elevated border border-border-subtle"
            >
              <AlertCircle className="h-4 w-4 text-text-tertiary" />
              <span className="text-xs text-text-secondary">
                Connect wallet to trade
              </span>
            </motion.div>
          ) : (
            <motion.button
              key="submit"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              onClick={handleSubmit}
              disabled={!price || !amount || isSubmitting}
              className={cn(
                "w-full h-10 rounded-lg font-semibold text-sm",
                "transition-all duration-150",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isBuy
                  ? "bg-gradient-to-r from-success to-success-muted text-white hover:shadow-glow-success"
                  : "bg-gradient-to-r from-danger to-danger-muted text-white hover:shadow-glow-danger"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Encrypting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
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
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-success-subtle border border-success/20"
            >
              <CheckCircle className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-success">{successMessage}</span>
            </motion.div>
          )}
          {orderError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-danger-subtle border border-danger/20"
            >
              <AlertCircle className="h-3.5 w-3.5 text-danger" />
              <span className="text-xs text-danger">{orderError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy Notice */}
        <div className="pt-3 border-t border-border-subtle">
          <p className="text-[10px] text-text-muted leading-relaxed">
            Orders encrypted via Arcium MPC. Price and amount hidden until execution.
          </p>
        </div>
      </div>
    </div>
  );
};
