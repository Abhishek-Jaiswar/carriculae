import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Subject } from "@/lib/models/Subject";
import { Curriculum } from "@/lib/models/Curriculum";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    const subject = await Subject.findById(id);
    if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const curriculum = await Curriculum.findOne({ subjectId: id });
    return NextResponse.json({ subject, curriculum });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const subject = await Subject.findByIdAndUpdate(id, body, { returnDocument: "after" });
    return NextResponse.json(subject);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    await Subject.findByIdAndDelete(id);
    await Curriculum.findOneAndDelete({ subjectId: id });
    return NextResponse.json({ success: true });
}
