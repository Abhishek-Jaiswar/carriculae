import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; topicId: string }> }
) {
    await connectDB();
    const { id, topicId } = await params;
    const body = await req.json();
    const { status, notes, actualMinutes } = body;

    const updateFields: Record<string, unknown> = {};
    if (status !== undefined) updateFields["topics.$.status"] = status;
    if (notes !== undefined) updateFields["topics.$.notes"] = notes;
    if (actualMinutes !== undefined) updateFields["topics.$.actualMinutes"] = actualMinutes;
    if (status === "done") updateFields["topics.$.completedAt"] = new Date();

    const curriculum = await Curriculum.findOneAndUpdate(
        { subjectId: id, "topics._id": topicId },
        { $set: updateFields },
        { returnDocument: "after" }
    );

    // Recalculate completed topics
    const completedCount = curriculum?.topics.filter((t: { status: string }) => t.status === "done").length || 0;
    await Subject.findByIdAndUpdate(id, { completedTopics: completedCount });

    return NextResponse.json(curriculum);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; topicId: string }> }
) {
    await connectDB();
    const { id, topicId } = await params;

    const curriculum = await Curriculum.findOneAndUpdate(
        { subjectId: id },
        { $pull: { topics: { _id: topicId } } },
        { returnDocument: "after" }
    );

    const total = curriculum?.topics.length || 0;
    const completed = curriculum?.topics.filter((t: { status: string }) => t.status === "done").length || 0;
    await Subject.findByIdAndUpdate(id, { totalTopics: total, completedTopics: completed });

    return NextResponse.json({ success: true });
}
