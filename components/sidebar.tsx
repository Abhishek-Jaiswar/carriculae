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

interface ProgressSummary {
  todayMinutes: number;
  dailyGoalMinutes: number;
  user: {
    currentStreak: number;
  } | null;
}

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Subjects", href: "/dashboard/subjects", icon: BookOpen },
  { title: "Progress", href: "/dashboard/progress", icon: BarChart3 },
  { title: "Achievements", href: "/dashboard/achievements", icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
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

    fetch("/api/progress", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
      .then((data: ProgressSummary | null) => {
        if (mounted) {
          setProgress(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setProgress(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const todayMinutes = progress?.todayMinutes ?? 0;
  const dailyGoalMinutes = progress?.dailyGoalMinutes ?? 60;
  const currentStreak = progress?.user?.currentStreak ?? 0;
  const remaining = Math.max(dailyGoalMinutes - todayMinutes, 0);

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
                <span className="truncate font-semibold">Carriculae</span>
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
            <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:hidden">
              <div className="mb-1 flex items-center gap-2 text-sidebar-accent-foreground">
                <Flame className="size-4" />
                <p className="text-xs font-medium">{currentStreak} day streak</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {remaining === 0
                  ? "Daily goal completed. Keep momentum going."
                  : `${remaining}m left to hit today's goal.`}
              </p>
            </div>
            <div className="hidden justify-center group-data-[collapsible=icon]:flex">
              <Button variant="ghost" size="icon-sm" title={`${currentStreak} day streak`}>
                <Flame />
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-lg border border-sidebar-border p-2 group-data-[collapsible=icon]:hidden">
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
        <div className="hidden flex-col items-center gap-2 group-data-[collapsible=icon]:flex">
          <Button variant="outline" size="icon-sm" title={user?.name || "Learner"}>
            <UserRound />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            title="Logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </SidebarRoot>
  );
}
