import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";
import { getFirstIncompleteTopicId, isTopicUnlocked } from "@/lib/topic-progress";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; topicId: string }> }
) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id, topicId } = await params;
    const body = await req.json();
    const { status, notes, actualMinutes, plannedStartAt, plannedEndAt, paceMinutesPerDay, resources, subtopics } = body;

    const existing = await Curriculum.findOne({ subjectId: id, userId });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const existingTopic = existing.topics?.find((t: { _id: unknown }) => String(t._id) === topicId);
    if (!existingTopic) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (status === "done") {
        const quizStatus = (existingTopic as { quiz?: { status?: string } }).quiz?.status;
        if (quizStatus !== "passed") {
            return NextResponse.json({ error: "Pass the quiz before completing this topic." }, { status: 409 });
        }
    }

    if ((status === "in-progress" || status === "done") && !isTopicUnlocked(existing.topics, topicId)) {
        const requiredTopicId = getFirstIncompleteTopicId(existing.topics);
        return NextResponse.json(
            { error: "Topic is locked. Complete the current topic first.", requiredTopicId },
            { status: 409 }
        );
    }

    const updateFields: Record<string, unknown> = {};
    if (status !== undefined) updateFields["topics.$.status"] = status;
    if (notes !== undefined) updateFields["topics.$.notes"] = notes;
    if (actualMinutes !== undefined) updateFields["topics.$.actualMinutes"] = actualMinutes;
    if (plannedStartAt !== undefined) {
        updateFields["topics.$.plannedStartAt"] =
            plannedStartAt ? new Date(String(plannedStartAt)) : null;
    }
    if (plannedEndAt !== undefined) {
        updateFields["topics.$.plannedEndAt"] =
            plannedEndAt ? new Date(String(plannedEndAt)) : null;
    }
    if (paceMinutesPerDay !== undefined) {
        const n = Number(paceMinutesPerDay);
        updateFields["topics.$.paceMinutesPerDay"] =
            Number.isFinite(n) ? Math.max(10, Math.min(720, Math.round(n))) : null;
    }
    if (resources !== undefined) {
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
        updateFields["topics.$.resources"] = parsedResources;
    }
    if (subtopics !== undefined) {
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
        updateFields["topics.$.subtopics"] = parsedSubtopics;
    }
    if (status === "done") updateFields["topics.$.completedAt"] = new Date();

    const curriculum = await Curriculum.findOneAndUpdate(
        { subjectId: id, userId, "topics._id": topicId },
        { $set: updateFields },
        { returnDocument: "after" }
    );

    if (!curriculum) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Recalculate completed topics
    const completedCount = curriculum?.topics.filter((t: { status: string }) => t.status === "done").length || 0;
    await Subject.findByIdAndUpdate(id, { completedTopics: completedCount });

    return NextResponse.json(curriculum);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; topicId: string }> }
) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id, topicId } = await params;

    const curriculum = await Curriculum.findOneAndUpdate(
        { subjectId: id, userId },
        { $pull: { topics: { _id: topicId } } },
        { returnDocument: "after" }
    );

    if (!curriculum) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const total = curriculum?.topics.length || 0;
    const completed = curriculum?.topics.filter((t: { status: string }) => t.status === "done").length || 0;
    await Subject.findByIdAndUpdate(id, { totalTopics: total, completedTopics: completed });

    return NextResponse.json({ success: true });
}
