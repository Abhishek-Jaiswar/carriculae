import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Curriculam - Learn & Grow Daily",
  description:
    "Track your learning lifecycle, build curriculums, and grow daily with AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
