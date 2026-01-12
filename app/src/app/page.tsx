"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet, Lock, ExternalLink } from "lucide-react";
import {
  Header,
  OrderForm,
  OrderBook,
  OpenOrders,
  TradeHistory,
  MarketStats,
  DepositWithdrawModal,
} from "@/components";
import { useUserPosition } from "@/hooks";

export default function TradingPage() {
  const { connected } = useWallet();
  const { walletBalances, depositedBalances } = useUserPosition();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-5">
        {/* Market Stats Bar */}
        <div className="mb-5">
          <MarketStats />
        </div>

        {/* Main Trading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Order Form */}
          <div className="lg:col-span-3 space-y-4">
            <OrderForm baseSymbol="SOL" quoteSymbol="USDC" />

            {/* Deposit/Withdraw Button */}
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-text-secondary font-medium text-sm hover:bg-surface-overlay hover:border-border hover:text-text-primary transition-all"
            >
              <Wallet className="h-3.5 w-3.5" />
              Manage Funds
            </button>
          </div>

          {/* Center Column - Order Book */}
          <div className="lg:col-span-5">
            <OrderBook />
          </div>

          {/* Right Column - Orders & History */}
          <div className="lg:col-span-4 space-y-4">
            <OpenOrders />
            <TradeHistory />
          </div>
        </div>

        {/* Privacy Banner */}
        <div className="mt-6 p-4 rounded-xl card border-l-2 border-l-accent">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10 border border-accent/20">
                <Lock className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-sm text-text-primary">
                  Trade with complete privacy
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Orders encrypted using Arcium MPC. Order details hidden from attackers.
                </p>
              </div>
            </div>
            <a
              href="https://arcium.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-xs font-medium hover:bg-accent/15 transition-colors"
            >
              Learn More
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-4 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <p className="font-mono text-[10px] text-text-muted">
                Dusk Exchange
              </p>
              <span className="text-text-muted/50">|</span>
              <p className="font-mono text-[10px] text-text-muted">
                Powered by Arcium MPC
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-elevated transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-elevated transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
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
