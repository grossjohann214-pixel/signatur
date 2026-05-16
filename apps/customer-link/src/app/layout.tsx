import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SingulAI Validate - Assinatura",
  description: "Fluxo de assinatura e confirmacao",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-flow-50 to-white text-gray-900">{children}</body>
    </html>
  );
}
