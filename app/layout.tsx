import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Impostor · Clash Royale",
  description: "Jogo de impostor com cartas do Clash Royale",
  themeColor: "#060810",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ position: "relative", zIndex: 1 }}>{children}</body>
    </html>
  );
}
