import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { title, description, estimatedMinutes, resources, order } = body;

    const curriculum = await Curriculum.findOneAndUpdate(
        { subjectId: id },
        {
            $push: {
                topics: {
                    title,
                    description,
                    estimatedMinutes: estimatedMinutes || 30,
                    resources: resources || [],
                    order: order || 0,
                    status: "todo",
                },
            },
        },
        { returnDocument: "after", upsert: true }
    );

    // Update total topics count on subject
    const topicsCount = curriculum.topics.length;
    await Subject.findByIdAndUpdate(id, { totalTopics: topicsCount });

    return NextResponse.json(curriculum, { status: 201 });
}
