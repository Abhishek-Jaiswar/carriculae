import { Schema, model, models } from "mongoose";

const ResourceSchema = new Schema({
    title: String,
    url: String,
    type: { type: String, enum: ["video", "article", "book", "other"], default: "article" },
});

const TopicSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["todo", "in-progress", "done"],
        default: "todo",
    },
    estimatedMinutes: { type: Number, default: 30 },
    actualMinutes: { type: Number, default: 0 },
    resources: [ResourceSchema],
    notes: { type: String, default: "" },
    completedAt: { type: Date, default: null },
});

const CurriculumSchema = new Schema(
    {
        subjectId: { type: String, required: true, index: true },
        userId: { type: String, required: true },
        aiGenerated: { type: Boolean, default: false },
        topics: [TopicSchema],
    },
    { timestamps: true }
);

export const Curriculum = models.Curriculum || model("Curriculum", CurriculumSchema);
