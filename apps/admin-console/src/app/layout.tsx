import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SingulAI Validate - Admin Console",
  description: "Partner approval and management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
