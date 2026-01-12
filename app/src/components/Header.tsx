"use client";

import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Shield, Lock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export const Header: FC = () => {
  const { connected } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-dusk-800/50 bg-dusk-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cipher-500/20 to-cipher-500/5 border border-cipher-500/20">
              <Shield className="h-5 w-5 text-cipher-500" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cipher-500 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-white">
              DUSK
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-dusk-400">
              Private DEX
            </p>
          </div>
        </div>

        {/* Center - Status */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dusk-900/50 border border-dusk-700/50">
              <Lock className="h-3.5 w-3.5 text-cipher-500" />
              <span className="font-mono text-xs text-dusk-300">
                Encrypted Orders
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dusk-900/50 border border-dusk-700/50">
              <Activity className="h-3.5 w-3.5 text-cipher-500" />
              <span className="font-mono text-xs text-dusk-300">Devnet</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cipher-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right - Wallet */}
        <div className="flex items-center gap-4">
          {connected && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bull-glow border border-bull-500/20">
              <div className="h-2 w-2 rounded-full bg-bull-500" />
              <span className="font-mono text-xs text-bull-400">Connected</span>
            </div>
          )}
          <WalletMultiButton
            className={cn(
              "!h-10 !rounded-lg !px-4 !font-display !text-sm !font-medium",
              "!bg-dusk-800 !border !border-dusk-600 hover:!bg-dusk-700",
              "!transition-all !duration-200"
            )}
          />
        </div>
      </div>
    </header>
  );
};
