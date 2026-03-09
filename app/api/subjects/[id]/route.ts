import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Subject } from "@/lib/models/Subject";
import { Curriculum } from "@/lib/models/Curriculum";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const subject = await Subject.findOne({ _id: id, userId });
    if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const curriculum = await Curriculum.findOne({ subjectId: id, userId });
    return NextResponse.json({ subject, curriculum });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const subject = await Subject.findOneAndUpdate(
        { _id: id, userId },
        body,
        { returnDocument: "after" }
    );
    if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(subject);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const subject = await Subject.findOneAndDelete({ _id: id, userId });
    if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await Curriculum.findOneAndDelete({ subjectId: id, userId });
    return NextResponse.json({ success: true });
}
