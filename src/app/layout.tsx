import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Flashscore AI Predictor",
  description: "Moja apka do obstawiania",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className="antialiased bg-[#1a1a1a]">{children}</body>
    </html>
  );
}
