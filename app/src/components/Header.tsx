"use client";

import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Lock, Activity } from "lucide-react";

export const Header: FC = () => {
  const { connected } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            {/* Logo mark */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
              <Lock className="h-4 w-4 text-accent" strokeWidth={2} />
            </div>

            {/* Logo text */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-semibold tracking-tight text-text-primary">
                Dusk
              </span>
              <span className="text-[11px] font-medium text-text-tertiary tracking-wide">
                Exchange
              </span>
            </div>
          </div>

          {/* Network badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-surface-elevated border border-border-subtle">
            <span className="status-dot bg-accent status-dot-pulse" />
            <span className="font-mono text-[10px] text-text-secondary tracking-wide">
              DEVNET
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Privacy indicator */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle">
            <Lock className="h-3 w-3 text-accent" />
            <span className="text-xs text-text-secondary font-medium">
              MPC Secured
            </span>
          </div>

          {/* Connection status */}
          {connected && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-success-subtle border border-success/20">
              <Activity className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">Live</span>
            </div>
          )}

          {/* Wallet button */}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
};
