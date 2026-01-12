"use client";

import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Shield, Zap } from "lucide-react";

export const Header: FC = () => {
  const { connected } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 shadow-glow-sm">
                <Shield className="h-4 w-4 text-accent" strokeWidth={2.5} />
              </div>
              {/* Subtle pulse indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-surface animate-pulse-subtle" />
            </div>

            {/* Logo text */}
            <div className="flex flex-col">
              <span className="font-display text-lg font-semibold tracking-tight text-text-primary">
                Dusk
              </span>
              <span className="font-mono text-[10px] text-text-tertiary tracking-wider uppercase">
                Exchange
              </span>
            </div>
          </div>

          {/* Network badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-subtle border border-accent/20">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[10px] text-accent tracking-wide">DEVNET</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Privacy indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle">
            <Zap className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono text-xs text-text-secondary">
              MPC Protected
            </span>
          </div>

          {/* Connection status */}
          {connected && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-subtle border border-success/20">
              <div className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="font-mono text-xs text-success">Connected</span>
            </div>
          )}

          {/* Wallet button */}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
};
