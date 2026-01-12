import type { Metadata } from "next";
import { WalletProvider } from "@/components/WalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dusk Exchange | Private Limit Order DEX",
  description:
    "Trade with complete privacy. Encrypted orders powered by Arcium MPC.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        {/* Subtle noise overlay */}
        <div className="noise-overlay" />

        {/* Ambient glow effects */}
        <div className="ambient-glow" style={{ top: "-200px", left: "20%" }} />
        <div className="ambient-glow" style={{ bottom: "-200px", right: "10%" }} />

        <WalletProvider>
          <div className="relative z-10">{children}</div>
        </WalletProvider>
      </body>
    </html>
  );
}
