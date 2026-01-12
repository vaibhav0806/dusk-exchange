"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet } from "lucide-react";
import {
  Header,
  OrderForm,
  OrderBook,
  OpenOrders,
  TradeHistory,
  MarketStats,
  DepositWithdrawModal,
} from "@/components";
import { cn } from "@/lib/utils";
import { useUserPosition } from "@/hooks";

export default function TradingPage() {
  const { connected } = useWallet();
  const { walletBalances, depositedBalances } = useUserPosition();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6">
        {/* Market Stats Bar */}
        <div className="mb-6">
          <MarketStats />
        </div>

        {/* Main Trading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Order Form */}
          <div className="lg:col-span-3 space-y-6">
            <OrderForm
              baseSymbol="SOL"
              quoteSymbol="USDC"
            />

            {/* Deposit/Withdraw Button */}
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "py-3 rounded-xl",
                "bg-dusk-800 border border-dusk-700",
                "text-dusk-300 font-display font-medium",
                "hover:bg-dusk-700 hover:border-dusk-600",
                "transition-all duration-200"
              )}
            >
              <Wallet className="h-4 w-4" />
              Manage Funds
            </button>
          </div>

          {/* Center Column - Order Book */}
          <div className="lg:col-span-5">
            <OrderBook />
          </div>

          {/* Right Column - Orders & History */}
          <div className="lg:col-span-4 space-y-6">
            <OpenOrders />
            <TradeHistory />
          </div>
        </div>

        {/* Privacy Banner */}
        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-cipher-500/5 via-cipher-500/10 to-cipher-500/5 border border-cipher-500/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cipher-500/10 border border-cipher-500/20">
                <svg
                  className="h-5 w-5 text-cipher-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-display font-medium text-white">
                  Trade with complete privacy
                </p>
                <p className="text-sm text-dusk-400">
                  Your orders are encrypted using Arcium MPC. Attackers cannot
                  see your order details.
                </p>
              </div>
            </div>
            <a
              href="https://arcium.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2 rounded-lg bg-cipher-500/10 border border-cipher-500/20 text-cipher-400 text-sm font-medium hover:bg-cipher-500/20 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dusk-800/50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-dusk-500">
              Dusk Exchange &copy; 2026 | Built for Solana Privacy Hack
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                className="text-dusk-500 hover:text-dusk-300 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                className="text-dusk-500 hover:text-dusk-300 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Deposit/Withdraw Modal */}
      <DepositWithdrawModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  );
}
