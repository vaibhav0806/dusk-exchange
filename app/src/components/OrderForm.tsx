"use client";

import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Lock, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
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

  // Use deposited balances for trading
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
      setSuccessMessage(`${isBuy ? "Buy" : "Sell"} order placed successfully!`);
      setPrice("");
      setAmount("");

      // Clear success message after 3 seconds
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
    <div className="glass-panel rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-lg font-semibold text-white">
          Place Order
        </h2>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cipher-glow border border-cipher-500/20">
          <Lock className="h-3 w-3 text-cipher-500" />
          <span className="font-mono text-[10px] text-cipher-400">ENCRYPTED</span>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="relative flex mb-5 p-1 bg-dusk-900 rounded-xl">
        <motion.div
          className={cn(
            "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-colors",
            isBuy ? "bg-bull-500/20" : "bg-bear-500/20"
          )}
          animate={{ x: isBuy ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <button
          onClick={() => setSide("buy")}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-medium transition-colors",
            isBuy ? "text-bull-400" : "text-dusk-400 hover:text-dusk-300"
          )}
        >
          <TrendingUp className="h-4 w-4" />
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-medium transition-colors",
            !isBuy ? "text-bear-400" : "text-dusk-400 hover:text-dusk-300"
          )}
        >
          <TrendingDown className="h-4 w-4" />
          Sell
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Price Input */}
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm text-dusk-400">Price</span>
            <span className="font-mono text-xs text-dusk-500">
              {quoteSymbol}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className={cn(
                "w-full h-12 px-4 rounded-xl",
                "bg-dusk-900 border border-dusk-700",
                "font-mono text-lg text-white placeholder:text-dusk-600",
                "input-cipher transition-all duration-200"
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-dusk-800 border border-dusk-700">
              <span className="font-mono text-xs text-dusk-400">
                {quoteSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm text-dusk-400">Amount</span>
            <span className="font-mono text-xs text-dusk-500">
              Balance: {formatNumber(isBuy ? quoteBalance : baseBalance, 4)}{" "}
              {isBuy ? quoteSymbol : baseSymbol}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0000"
              className={cn(
                "w-full h-12 px-4 rounded-xl",
                "bg-dusk-900 border border-dusk-700",
                "font-mono text-lg text-white placeholder:text-dusk-600",
                "input-cipher transition-all duration-200"
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-dusk-800 border border-dusk-700">
              <span className="font-mono text-xs text-dusk-400">
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
              className={cn(
                "flex-1 py-1.5 rounded-lg",
                "bg-dusk-900 border border-dusk-700",
                "font-mono text-xs text-dusk-400",
                "hover:border-cipher-500/30 hover:text-cipher-400",
                "transition-all duration-200"
              )}
            >
              {pct * 100}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="p-4 rounded-xl bg-dusk-900/50 border border-dusk-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-dusk-400">Total</span>
            <span className="font-mono text-lg text-white">
              {formatNumber(total, 2)} {quoteSymbol}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <AnimatePresence mode="wait">
          {!connected ? (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-4 rounded-xl bg-dusk-900 border border-dusk-700"
            >
              <AlertCircle className="h-4 w-4 text-dusk-400" />
              <span className="text-sm text-dusk-400">
                Connect wallet to trade
              </span>
            </motion.div>
          ) : (
            <motion.button
              key="submit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={handleSubmit}
              disabled={!price || !amount || isSubmitting}
              className={cn(
                "w-full h-12 rounded-xl font-display font-semibold text-base",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isBuy
                  ? "bg-gradient-to-r from-bull-500 to-bull-400 text-dusk-950 hover:shadow-[0_0_24px_rgba(0,200,83,0.3)]"
                  : "bg-gradient-to-r from-bear-500 to-bear-400 text-white hover:shadow-[0_0_24px_rgba(255,23,68,0.3)]"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Encrypting...
                </span>
              ) : (
                `${isBuy ? "Buy" : "Sell"} ${baseSymbol}`
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 rounded-lg bg-bull-500/10 border border-bull-500/20 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4 text-bull-400" />
            <p className="text-sm text-bull-400">{successMessage}</p>
          </motion.div>
        )}
        {orderError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 rounded-lg bg-bear-500/10 border border-bear-500/20 flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 text-bear-400" />
            <p className="text-sm text-bear-400">{orderError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Notice */}
      <div className="mt-4 p-3 rounded-lg bg-cipher-glow/50 border border-cipher-500/10">
        <p className="text-[11px] text-cipher-400 leading-relaxed">
          Your order details are encrypted using Arcium MPC. Price and amount
          remain hidden until execution.
        </p>
      </div>
    </div>
  );
};
