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
        `Successfully ${mode === "deposit" ? "deposited" : "withdrew"} ${amountNum} ${symbol}`
      );
      setAmount("");

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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-md max-h-full overflow-y-auto pointer-events-auto glass-panel-elevated rounded-3xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-subtle border border-accent/20">
                    <Wallet className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-text-primary">
                      Manage Funds
                    </h2>
                    <p className="text-xs text-text-muted">
                      Deposit or withdraw from your trading account
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
                >
                  <X className="h-5 w-5 text-text-muted" />
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="px-6 py-4 border-b border-border-subtle">
                <div className="relative flex p-1 bg-surface-elevated rounded-xl border border-border-subtle">
                  <motion.div
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-accent-subtle"
                    animate={{ x: mode === "deposit" ? 0 : "calc(100% + 4px)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <button
                    onClick={() => setMode("deposit")}
                    className={cn(
                      "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-medium text-sm transition-colors",
                      mode === "deposit" ? "text-accent" : "text-text-muted hover:text-text-secondary"
                    )}
                  >
                    <ArrowDownToLine className="h-4 w-4" />
                    Deposit
                  </button>
                  <button
                    onClick={() => setMode("withdraw")}
                    className={cn(
                      "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-medium text-sm transition-colors",
                      mode === "withdraw" ? "text-accent" : "text-text-muted hover:text-text-secondary"
                    )}
                  >
                    <ArrowUpFromLine className="h-4 w-4" />
                    Withdraw
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Token Selection */}
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2.5 block">
                    Select Token
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedToken("base")}
                      className={cn(
                        "p-4 rounded-xl border transition-all",
                        selectedToken === "base"
                          ? "bg-accent-subtle border-accent/30"
                          : "bg-surface-elevated border-border-subtle hover:border-border"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-display font-bold text-sm">
                          S
                        </div>
                        <div className="text-left">
                          <p className="font-display font-medium text-text-primary">
                            {baseSymbol}
                          </p>
                          <p className="font-mono text-xs text-text-muted">
                            {formatNumber(mode === "deposit" ? baseBalance : baseDeposited, 4)}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedToken("quote")}
                      className={cn(
                        "p-4 rounded-xl border transition-all",
                        selectedToken === "quote"
                          ? "bg-accent-subtle border-accent/30"
                          : "bg-surface-elevated border-border-subtle hover:border-border"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2775CA] flex items-center justify-center text-white font-display font-bold text-sm">
                          $
                        </div>
                        <div className="text-left">
                          <p className="font-display font-medium text-text-primary">
                            {quoteSymbol}
                          </p>
                          <p className="font-mono text-xs text-text-muted">
                            {formatNumber(mode === "deposit" ? quoteBalance : quoteDeposited, 2)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="flex items-center justify-between mb-2.5">
                    <span className="text-sm font-medium text-text-secondary">Amount</span>
                    <span className="font-mono text-xs text-text-muted">
                      Available: {formatNumber(availableBalance, 4)} {symbol}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-14 px-4 pr-20 rounded-xl input-premium font-mono text-xl text-text-primary placeholder:text-text-muted"
                    />
                    <button
                      onClick={handleMaxClick}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-accent-subtle border border-accent/20 text-accent font-mono text-xs hover:bg-accent/20 transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Balance Summary */}
                <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">
                      {mode === "deposit" ? "Wallet Balance" : "Deposited"}
                    </span>
                    <span className="font-mono text-sm text-text-secondary">
                      {formatNumber(mode === "deposit" ? walletBalance : depositedBalance, 4)} {symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      After {mode === "deposit" ? "Deposit" : "Withdrawal"}
                    </span>
                    <span className="font-mono text-sm font-medium text-text-primary">
                      {formatNumber(
                        mode === "deposit"
                          ? depositedBalance + parseFloat(amount || "0")
                          : depositedBalance - parseFloat(amount || "0"),
                        4
                      )} {symbol}
                    </span>
                  </div>
                </div>

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
                  {actionError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-danger-subtle border border-danger/20"
                    >
                      <AlertCircle className="h-4 w-4 text-danger" />
                      <span className="text-sm text-danger">{actionError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance || isSubmitting}
                  className="w-full h-12 rounded-xl font-display font-semibold text-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      `${mode === "deposit" ? "Deposit" : "Withdraw"} ${symbol}`
                    )}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
