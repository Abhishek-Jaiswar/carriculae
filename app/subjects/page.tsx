"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, BookOpen, Clock, CheckCircle, ChevronRight } from "lucide-react";
import { SubjectIcon } from "@/components/app-icon";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Subject {
    _id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    skillLevel: string;
    tags: string[];
    totalTopics: number;
    completedTopics: number;
    totalMinutesSpent: number;
    lastStudiedAt: string | null;
}

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/subjects").then(r => r.json()).then(d => { setSubjects(d); setLoading(false); });
    }, []);

    const filtered = subjects.filter(s => {
        const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        if (filter === "completed") return matchSearch && s.completedTopics >= s.totalTopics && s.totalTopics > 0;
        if (filter === "in-progress") return matchSearch && s.completedTopics < s.totalTopics && s.completedTopics > 0;
        return matchSearch;
    });

    return (
        <div className="mx-auto max-w-5xl p-4 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Subjects</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">{subjects.length} subject{subjects.length !== 1 ? "s" : ""} total</p>
                </div>
                <Button asChild>
                    <Link href="/subjects/new"><Plus className="w-4 h-4" /> New Subject</Link>
                </Button>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Tabs defaultValue="all" onValueChange={setFilter}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search subjects or tags..." className="pl-8" />
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                    <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                    <div>
                        <p className="font-medium">No subjects yet</p>
                        <p className="text-muted-foreground text-sm mt-1">Create your first subject to start learning</p>
                    </div>
                    <Button asChild><Link href="/subjects/new">Create Subject</Link></Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {filtered.map(s => {
                        const pct = s.totalTopics > 0 ? Math.round(s.completedTopics / s.totalTopics * 100) : 0;
                        const hours = Math.round(s.totalMinutesSpent / 60 * 10) / 10;
                        return (
                            <Link key={s._id} href={`/subjects/${s._id}`}>
                                <Card className="hover:ring-ring/30 transition-all h-full">
                                    <CardHeader className="pb-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-muted">
                                                    <SubjectIcon icon={s.icon} className="size-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{s.title}</p>
                                                    <Badge variant="outline" className="mt-1 capitalize text-[10px]">{s.skillLevel}</Badge>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-3">
                                        {s.description && (
                                            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{s.description}</p>
                                        )}
                                        {s.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {s.tags.slice(0, 3).map(t => (
                                                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                                                ))}
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />{s.completedTopics}/{s.totalTopics}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{hours}h</span>
                                                </div>
                                                <span className="font-medium">{pct}%</span>
                                            </div>
                                            <Progress value={pct} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
