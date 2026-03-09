import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { title, description, estimatedMinutes, resources, subtopics, order, plannedStartAt, plannedEndAt, paceMinutesPerDay } = body;

    const subject = await Subject.findOne({ _id: id, userId });
    if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const parsedStart =
        typeof plannedStartAt === "string" && plannedStartAt.trim()
            ? new Date(plannedStartAt)
            : null;
    const parsedEnd =
        typeof plannedEndAt === "string" && plannedEndAt.trim()
            ? new Date(plannedEndAt)
            : null;
    const parsedPace =
        typeof paceMinutesPerDay === "number"
            ? Math.max(10, Math.min(720, Math.round(paceMinutesPerDay)))
            : null;

    const parsedResources = Array.isArray(resources)
        ? resources
            .map((r) => {
                if (!r || typeof r !== "object") return null;
                const item = r as { title?: unknown; url?: unknown; type?: unknown };
                const title = String(item.title || "").trim().slice(0, 120);
                const url = String(item.url || "").trim().slice(0, 400);
                const typeRaw = String(item.type || "").trim().toLowerCase();
                const type = ["video", "article", "book", "other"].includes(typeRaw) ? typeRaw : "article";
                if (!title && !url) return null;
                return { title, url, type };
            })
            .filter(Boolean)
            .slice(0, 20)
        : [];

    const parsedSubtopics = Array.isArray(subtopics)
        ? subtopics
            .map((s) => {
                if (!s || typeof s !== "object") return null;
                const item = s as { title?: unknown; done?: unknown };
                const title = String(item.title || "").trim().slice(0, 120);
                if (!title) return null;
                return { title, done: Boolean(item.done) };
            })
            .filter(Boolean)
            .slice(0, 50)
        : [];
    if (
        parsedStart &&
        parsedEnd &&
        !Number.isNaN(parsedStart.getTime()) &&
        !Number.isNaN(parsedEnd.getTime()) &&
        parsedEnd.getTime() < parsedStart.getTime()
    ) {
        return NextResponse.json(
            { error: "Target date-time must be after start date-time." },
            { status: 400 }
        );
    }

    const curriculum = await Curriculum.findOneAndUpdate(
        { subjectId: id, userId },
        {
            $setOnInsert: { subjectId: id, userId },
            $push: {
                topics: {
                    title,
                    description,
                    estimatedMinutes: estimatedMinutes || 30,
                    resources: parsedResources,
                    subtopics: parsedSubtopics,
                    order: order || 0,
                    status: "todo",
                    plannedStartAt: parsedStart && !Number.isNaN(parsedStart.getTime()) ? parsedStart : null,
                    plannedEndAt: parsedEnd && !Number.isNaN(parsedEnd.getTime()) ? parsedEnd : null,
                    paceMinutesPerDay: parsedPace,
                },
            },
        },
        { returnDocument: "after", upsert: true }
    );

    if (!curriculum) return NextResponse.json({ error: "Failed to add topic" }, { status: 500 });

    // Update total topics count on subject
    const topicsCount = curriculum.topics.length;
    await Subject.findByIdAndUpdate(id, { totalTopics: topicsCount });

    return NextResponse.json(curriculum, { status: 201 });
}
