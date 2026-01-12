"use client";

import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Lock, Activity, Coins, RefreshCw } from "lucide-react";
import { useDuskExchange } from "@/hooks";

export const Header: FC = () => {
  const { connected } = useWallet();
  const { marketStatus, requestAirdrop, isLoading, refreshMarket } = useDuskExchange();
  const [airdropStatus, setAirdropStatus] = useState<string | null>(null);

  const handleAirdrop = async () => {
    try {
      setAirdropStatus("Requesting...");
      await requestAirdrop();
      setAirdropStatus("✓ 2 SOL received!");
      setTimeout(() => setAirdropStatus(null), 3000);
    } catch (err) {
      setAirdropStatus("✗ Failed");
      setTimeout(() => setAirdropStatus(null), 3000);
    }
  };

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
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-warning/10 border border-warning/20">
            <span className="status-dot bg-warning status-dot-pulse" />
            <span className="font-mono text-[10px] text-warning tracking-wide">
              LOCALNET
            </span>
          </div>

          {/* Market status */}
          <button 
            onClick={() => refreshMarket()}
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-surface-elevated border border-border-subtle hover:border-border transition-colors"
          >
            <RefreshCw className={`h-3 w-3 text-text-muted ${isLoading ? 'animate-spin' : ''}`} />
            <span className="font-mono text-[10px] text-text-secondary">
              {marketStatus}
            </span>
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Airdrop button (localnet only) */}
          {connected && (
            <button
              onClick={handleAirdrop}
              disabled={isLoading || airdropStatus !== null}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors disabled:opacity-50"
            >
              <Coins className="h-3 w-3 text-accent" />
              <span className="text-xs text-accent font-medium">
                {airdropStatus || "Airdrop SOL"}
              </span>
            </button>
          )}

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
