import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PanelLeft } from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

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
        <SidebarProvider defaultOpen>
          <Sidebar />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
              <SidebarTrigger>
                <PanelLeft />
              </SidebarTrigger>
              <Separator orientation="vertical" className="mr-2 h-4" />
              <p className="text-sm text-muted-foreground">Learning Workspace</p>
            </header>
            <main className="flex-1 overflow-y-auto">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
