import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SingulAI Validate - Assinatura",
  description: "Fluxo de assinatura e confirmacao",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-flow-50 to-white text-gray-900">{children}</body>
    </html>
  );
}
