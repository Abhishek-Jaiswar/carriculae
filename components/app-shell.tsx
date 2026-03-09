"use client";

import Link from "next/link";
import { ChevronRight, PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

interface AppShellProps {
  children: React.ReactNode;
}

const PLAIN_LAYOUT_ROUTES = new Set(["/", "/login", "/signup"]);
const HIDDEN_BREADCRUMB_SEGMENTS = new Set(["dashboard"]);

function formatSegment(segment: string) {
  if (!segment) return "";
  if (segment.length === 24 && /^[a-f0-9]+$/i.test(segment)) return "Subject";
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isPlainLayoutRoute = PLAIN_LAYOUT_ROUTES.has(pathname);
  const rawSegments = pathname.split("/").filter(Boolean);
  const crumbs = [{ href: "/dashboard", label: "Dashboard" }];
  const cumulative: string[] = [];
  for (const segment of rawSegments) {
    cumulative.push(segment);
    if (HIDDEN_BREADCRUMB_SEGMENTS.has(segment)) continue;
    crumbs.push({
      href: `/${cumulative.join("/")}`,
      label: formatSegment(segment),
    });
  }

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
        <SidebarInset className="h-svh overflow-hidden">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <SidebarTrigger>
              <PanelLeft />
            </SidebarTrigger>
            <Separator orientation="vertical" className="mr-2 h-4" />
            <nav className="flex min-w-0 items-center gap-1 text-sm">
              {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                return (
                  <div key={`${crumb.href}-${idx}`} className="flex min-w-0 items-center gap-1">
                    {isLast ? (
                      <span className="truncate font-medium text-foreground">{crumb.label}</span>
                    ) : (
                      <Link href={crumb.href} className="truncate text-muted-foreground hover:text-foreground">
                        {crumb.label}
                      </Link>
                    )}
                    {!isLast ? <ChevronRight className="size-3.5 text-muted-foreground/70" /> : null}
                  </div>
                );
              })}
            </nav>
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
