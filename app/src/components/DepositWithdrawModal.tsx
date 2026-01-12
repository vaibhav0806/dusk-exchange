"use client";

import { FC, useState } from "react";
import { X, ArrowDownToLine, ArrowUpFromLine, Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useDeposit, useUserPosition } from "@/hooks";

type ModalMode = "deposit" | "withdraw";

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseSymbol?: string;
  quoteSymbol?: string;
}

export const DepositWithdrawModal: FC<DepositWithdrawModalProps> = ({
  isOpen,
  onClose,
  baseSymbol = "SOL",
  quoteSymbol = "USDC",
}) => {
  const { deposit, withdraw, isLoading: isActionLoading, error: actionError } = useDeposit();
  const { walletBalances, depositedBalances } = useUserPosition();

  const [mode, setMode] = useState<ModalMode>("deposit");
  const [selectedToken, setSelectedToken] = useState<"base" | "quote">("base");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use real balances from hooks
  const baseBalance = walletBalances.base;
  const quoteBalance = walletBalances.quote;
  const baseDeposited = depositedBalances.base;
  const quoteDeposited = depositedBalances.quote;

  const isBase = selectedToken === "base";
  const symbol = isBase ? baseSymbol : quoteSymbol;
  const walletBalance = isBase ? baseBalance : quoteBalance;
  const depositedBalance = isBase ? baseDeposited : quoteDeposited;
  const availableBalance = mode === "deposit" ? walletBalance : depositedBalance;

  const handleSubmit = async () => {
    if (!amount) return;
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const amountNum = parseFloat(amount);
      if (mode === "deposit") {
        await deposit(amountNum, isBase);
      } else {
        await withdraw(amountNum, isBase);
      }

      setSuccessMessage(
        `Successfully ${mode === "deposit" ? "deposited" : "withdrew"} ${amountNum} ${symbol}!`
      );
      setAmount("");

      // Close modal after short delay
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(`${mode} failed:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(availableBalance.toString());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-dusk-950/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="glass-panel rounded-2xl border border-dusk-700/50 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-dusk-800/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cipher-glow border border-cipher-500/20">
                    <Wallet className="h-5 w-5 text-cipher-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-white">
                      Manage Funds
                    </h2>
                    <p className="text-xs text-dusk-400">
                      Deposit or withdraw from your trading account
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-dusk-800 transition-colors"
                >
                  <X className="h-5 w-5 text-dusk-400" />
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="p-5 border-b border-dusk-800/50">
                <div className="relative flex p-1 bg-dusk-900 rounded-xl">
                  <motion.div
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-cipher-500/20"
                    animate={{ x: mode === "deposit" ? 0 : "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <button
                    onClick={() => setMode("deposit")}
                    className={cn(
                      "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-medium transition-colors",
                      mode === "deposit"
                        ? "text-cipher-400"
                        : "text-dusk-400 hover:text-dusk-300"
                    )}
                  >
                    <ArrowDownToLine className="h-4 w-4" />
                    Deposit
                  </button>
                  <button
                    onClick={() => setMode("withdraw")}
                    className={cn(
                      "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-medium transition-colors",
                      mode === "withdraw"
                        ? "text-cipher-400"
                        : "text-dusk-400 hover:text-dusk-300"
                    )}
                  >
                    <ArrowUpFromLine className="h-4 w-4" />
                    Withdraw
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-5">
                {/* Token Selection */}
                <div>
                  <label className="text-sm text-dusk-400 mb-2 block">
                    Select Token
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedToken("base")}
                      className={cn(
                        "p-4 rounded-xl border transition-all",
                        selectedToken === "base"
                          ? "bg-cipher-glow border-cipher-500/30"
                          : "bg-dusk-900 border-dusk-700 hover:border-dusk-600"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-bold text-xs">
                          S
                        </div>
                        <div className="text-left">
                          <p className="font-display font-medium text-white">
                            {baseSymbol}
                          </p>
                          <p className="font-mono text-xs text-dusk-400">
                            {formatNumber(
                              mode === "deposit" ? baseBalance : baseDeposited,
                              4
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedToken("quote")}
                      className={cn(
                        "p-4 rounded-xl border transition-all",
                        selectedToken === "quote"
                          ? "bg-cipher-glow border-cipher-500/30"
                          : "bg-dusk-900 border-dusk-700 hover:border-dusk-600"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2775CA] flex items-center justify-center text-white font-bold text-xs">
                          $
                        </div>
                        <div className="text-left">
                          <p className="font-display font-medium text-white">
                            {quoteSymbol}
                          </p>
                          <p className="font-mono text-xs text-dusk-400">
                            {formatNumber(
                              mode === "deposit" ? quoteBalance : quoteDeposited,
                              2
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm text-dusk-400">Amount</span>
                    <span className="font-mono text-xs text-dusk-500">
                      Available: {formatNumber(availableBalance, 4)} {symbol}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className={cn(
                        "w-full h-14 px-4 pr-20 rounded-xl",
                        "bg-dusk-900 border border-dusk-700",
                        "font-mono text-xl text-white placeholder:text-dusk-600",
                        "input-cipher transition-all duration-200"
                      )}
                    />
                    <button
                      onClick={handleMaxClick}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-cipher-500/10 border border-cipher-500/20 text-cipher-400 font-mono text-xs hover:bg-cipher-500/20 transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Balance Summary */}
                <div className="p-4 rounded-xl bg-dusk-900/50 border border-dusk-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-dusk-400">
                      {mode === "deposit" ? "Wallet Balance" : "Deposited"}
                    </span>
                    <span className="font-mono text-sm text-dusk-300">
                      {formatNumber(
                        mode === "deposit" ? walletBalance : depositedBalance,
                        4
                      )}{" "}
                      {symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dusk-400">
                      After {mode === "deposit" ? "Deposit" : "Withdrawal"}
                    </span>
                    <span className="font-mono text-sm text-white">
                      {formatNumber(
                        mode === "deposit"
                          ? (depositedBalance + parseFloat(amount || "0"))
                          : (depositedBalance - parseFloat(amount || "0")),
                        4
                      )}{" "}
                      {symbol}
                    </span>
                  </div>
                </div>

                {/* Success/Error Messages */}
                <AnimatePresence>
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-lg bg-bull-500/10 border border-bull-500/20 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4 text-bull-400" />
                      <p className="text-sm text-bull-400">{successMessage}</p>
                    </motion.div>
                  )}
                  {actionError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-lg bg-bear-500/10 border border-bear-500/20 flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4 text-bear-400" />
                      <p className="text-sm text-bear-400">{actionError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance || isSubmitting}
                  className={cn(
                    "w-full h-12 rounded-xl font-display font-semibold",
                    "bg-gradient-to-r from-cipher-500 to-cipher-400 text-dusk-950",
                    "hover:shadow-glow transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-dusk-950 border-t-transparent animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `${mode === "deposit" ? "Deposit" : "Withdraw"} ${symbol}`
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
