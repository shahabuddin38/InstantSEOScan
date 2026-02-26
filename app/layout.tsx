import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instant SEO Scan",
  description: "Fast, AI-powered SEO analysis for your website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
