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
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-md max-h-full overflow-y-auto pointer-events-auto card shadow-strong">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10 border border-accent/20">
                    <Wallet className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">
                      Manage Funds
                    </h2>
                    <p className="text-[11px] text-text-muted">
                      Deposit or withdraw from trading account
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md hover:bg-surface-elevated transition-colors"
                >
                  <X className="h-4 w-4 text-text-muted" />
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="px-5 py-3 border-b border-border-subtle">
                <div className="relative flex p-0.5 bg-surface-elevated rounded-lg">
                  <motion.div
                    className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md bg-accent/10"
                    animate={{ x: mode === "deposit" ? 0 : "calc(100% + 2px)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                  <button
                    onClick={() => setMode("deposit")}
                    className={cn(
                      "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-medium text-sm transition-colors",
                      mode === "deposit" ? "text-accent" : "text-text-muted hover:text-text-secondary"
                    )}
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" />
                    Deposit
                  </button>
                  <button
                    onClick={() => setMode("withdraw")}
                    className={cn(
                      "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-medium text-sm transition-colors",
                      mode === "withdraw" ? "text-accent" : "text-text-muted hover:text-text-secondary"
                    )}
                  >
                    <ArrowUpFromLine className="h-3.5 w-3.5" />
                    Withdraw
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Token Selection */}
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-2 block">
                    Select Token
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedToken("base")}
                      className={cn(
                        "p-3 rounded-lg border transition-all",
                        selectedToken === "base"
                          ? "bg-accent/5 border-accent/30"
                          : "bg-surface-elevated border-border-subtle hover:border-border"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-semibold text-xs">
                          S
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm text-text-primary">
                            {baseSymbol}
                          </p>
                          <p className="font-mono text-[10px] text-text-muted">
                            {formatNumber(mode === "deposit" ? baseBalance : baseDeposited, 4)}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedToken("quote")}
                      className={cn(
                        "p-3 rounded-lg border transition-all",
                        selectedToken === "quote"
                          ? "bg-accent/5 border-accent/30"
                          : "bg-surface-elevated border-border-subtle hover:border-border"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#2775CA] flex items-center justify-center text-white font-semibold text-xs">
                          $
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm text-text-primary">
                            {quoteSymbol}
                          </p>
                          <p className="font-mono text-[10px] text-text-muted">
                            {formatNumber(mode === "deposit" ? quoteBalance : quoteDeposited, 2)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-text-secondary">Amount</span>
                    <span className="font-mono text-[10px] text-text-muted">
                      Available: {formatNumber(availableBalance, 4)} {symbol}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 px-3 pr-16 rounded-lg input-field font-mono text-base text-text-primary placeholder:text-text-muted"
                    />
                    <button
                      onClick={handleMaxClick}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-accent/10 border border-accent/20 text-accent font-mono text-[10px] font-medium hover:bg-accent/15 transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Balance Summary */}
                <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {mode === "deposit" ? "Wallet Balance" : "Deposited"}
                    </span>
                    <span className="font-mono text-xs text-text-secondary">
                      {formatNumber(mode === "deposit" ? walletBalance : depositedBalance, 4)} {symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      After {mode === "deposit" ? "Deposit" : "Withdrawal"}
                    </span>
                    <span className="font-mono text-xs font-medium text-text-primary">
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
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-success-subtle border border-success/20"
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                      <span className="text-xs text-success">{successMessage}</span>
                    </motion.div>
                  )}
                  {actionError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-danger-subtle border border-danger/20"
                    >
                      <AlertCircle className="h-3.5 w-3.5 text-danger" />
                      <span className="text-xs text-danger">{actionError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance || isSubmitting}
                  className="w-full h-10 rounded-lg font-semibold text-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
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
