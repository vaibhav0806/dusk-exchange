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
      <body className="min-h-screen bg-dusk-950 antialiased">
        {/* Noise overlay for texture */}
        <div className="noise-overlay" />

        {/* Grid background */}
        <div
          className="fixed inset-0 bg-grid-pattern bg-grid pointer-events-none"
          style={{ opacity: 0.4 }}
        />

        {/* Radial gradient accent */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 212, 170, 0.08), transparent)",
          }}
        />

        <WalletProvider>
          <div className="relative z-10">{children}</div>
        </WalletProvider>
      </body>
    </html>
  );
}
