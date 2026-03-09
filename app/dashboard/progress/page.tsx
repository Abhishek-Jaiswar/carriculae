"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Clock, Zap, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgressData {
    user: { currentStreak: number; longestStreak: number; totalMinutesLearned: number } | null;
    todayMinutes: number;
    weeklyData: { date: string; label: string; minutes: number }[];
    subjectTime: { name: string; minutes: number; color: string }[];
    heatmap: Record<string, number>;
    totalSessions: number;
}

function Heatmap({ data }: { data: Record<string, number> }) {
    const days: { date: string; minutes: number }[] = [];
    for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        days.push({ date: key, minutes: data[key] || 0 });
    }
    const max = Math.max(...days.map(d => d.minutes), 1);

    return (
        <div>
            <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(18, 1fr)" }}>
                {days.map(d => {
                    const intensity = d.minutes / max;
                    return (
                        <div key={d.date} title={`${d.date}: ${d.minutes}m`}
                            className="heatmap-cell aspect-square rounded-sm cursor-pointer"
                            style={{
                                backgroundColor: d.minutes > 0
                                    ? `hsl(239 84% ${70 - intensity * 30}%)`
                                    : "hsl(var(--muted))"
                            }} />
                    );
                })}
            </div>
            <div className="flex items-center justify-end gap-1 mt-2">
                <span className="text-[10px] text-muted-foreground">Less</span>
                {[0.2, 0.4, 0.6, 0.8, 1].map(v => (
                    <div key={v} className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: `hsl(239 84% ${70 - v * 30}%)` }} />
                ))}
                <span className="text-[10px] text-muted-foreground">More</span>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-md">
                <p className="text-muted-foreground">{label}</p>
                <p className="font-medium">{payload[0].value}m</p>
            </div>
        );
    }
    return null;
};

export default function ProgressPage() {
    const [data, setData] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/progress").then(r => r.json()).then(d => { setData(d); setLoading(false); });
    }, []);

    if (loading) return (
        <div className="w-full space-y-6 p-4 md:p-8">
            <Skeleton className="h-8 w-48" />
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
    );

    const u = data?.user;
    const totalHours = Math.round((u?.totalMinutesLearned || 0) / 60 * 10) / 10;

    const stats = [
        { icon: Clock, label: "Total Hours", value: `${totalHours}h` },
        { icon: Zap, label: "Sessions", value: data?.totalSessions ?? 0 },
        { icon: TrendingUp, label: "Current Streak", value: `${u?.currentStreak || 0}d` },
        { icon: Calendar, label: "Best Streak", value: `${u?.longestStreak || 0}d` },
    ];

    return (
        <div className="w-full space-y-6 p-4 md:p-8">
            <div>
                <h1 className="text-2xl font-bold">Progress & Analytics</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Your complete learning history</p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ icon: Icon, label, value }) => (
                    <Card key={label} size="sm">
                        <CardContent className="flex flex-col gap-2 pt-4 pb-4">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <p className="text-2xl font-bold tabular-nums">{value}</p>
                            <p className="text-muted-foreground text-xs">{label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Heatmap */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-sm">90-Day Activity</CardTitle>
                    </div>
                    <CardDescription>Each cell represents minutes studied that day</CardDescription>
                </CardHeader>
                <CardContent>
                    <Heatmap data={data?.heatmap || {}} />
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Weekly bar chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            <CardTitle className="text-sm">Daily Minutes — Last 7 Days</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={data?.weeklyData}>
                                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                                    axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="minutes" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Per-subject donut */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <CardTitle className="text-sm">Time by Subject</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data?.subjectTime.filter(s => s.minutes > 0).length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-36 text-center">
                                <p className="text-muted-foreground text-sm">No data yet</p>
                                <p className="text-muted-foreground/50 text-xs mt-1">Start a session to see stats</p>
                            </div>
                        ) : (
                            <div className="flex gap-4 items-center">
                                <ResponsiveContainer width="50%" height={140}>
                                    <PieChart>
                                        <Pie data={data?.subjectTime.filter(s => s.minutes > 0)} dataKey="minutes"
                                            nameKey="name" innerRadius={35} outerRadius={60}>
                                            {data?.subjectTime.filter(s => s.minutes > 0).map((s, i) => (
                                                <Cell key={i} fill={s.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex-1 space-y-2">
                                    {data?.subjectTime.filter(s => s.minutes > 0).map(s => (
                                        <div key={s.name} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                            <p className="text-xs text-muted-foreground truncate flex-1">{s.name}</p>
                                            <Badge variant="secondary" className="text-[10px]">{Math.round(s.minutes / 60 * 10) / 10}h</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
