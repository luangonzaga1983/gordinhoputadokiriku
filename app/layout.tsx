import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Impostor — Clash Royale Edition",
  description: "Jogo de impostor com cartas do Clash Royale",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
