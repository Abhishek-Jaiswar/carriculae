"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Trophy,
  UserRound,
} from "lucide-react";

import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface AuthUser {
  userId: string;
  email?: string;
  name?: string;
}

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Subjects", href: "/subjects", icon: BookOpen },
  { title: "Progress", href: "/progress", icon: BarChart3 },
  { title: "Achievements", href: "/achievements", icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          return { user: null };
        }
        return res.json();
      })
      .then((data: { user: AuthUser | null }) => {
        if (mounted) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SidebarRoot collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GraduationCap className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Curriculam</span>
                <span className="truncate text-xs text-muted-foreground">
                  Learn daily
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
              <div className="mb-1 flex items-center gap-2 text-sidebar-accent-foreground">
                <Flame className="size-4" />
                <p className="text-xs font-medium">Keep the streak alive</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Add one short session today to keep momentum.
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-lg border border-sidebar-border p-2">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserRound className="size-4 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{user.name || "Learner"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email || ""}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut />
                {loggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium">Not logged in</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" className="w-full" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </SidebarRoot>
  );
}
