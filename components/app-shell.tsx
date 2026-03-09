"use client";

import { PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

interface AppShellProps {
  children: React.ReactNode;
}

const PLAIN_LAYOUT_ROUTES = new Set(["/", "/login", "/signup"]);

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isPlainLayoutRoute = PLAIN_LAYOUT_ROUTES.has(pathname);

  if (isPlainLayoutRoute) {
    return (
      <>
        <main className="min-h-screen">{children}</main>
        <Toaster />
      </>
    );
  }

  return (
    <>
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
    </>
  );
}
