import { Schema, model, models } from "mongoose";

const ResourceSchema = new Schema({
    title: String,
    url: String,
    type: { type: String, enum: ["video", "article", "book", "other"], default: "article" },
});

const SubtopicSchema = new Schema({
    title: { type: String, required: true },
    done: { type: Boolean, default: false },
});

const QuizQuestionSchema = new Schema({
    question: { type: String, required: true },
    options: [{ type: String }],
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: "" },
}, { _id: false });

const TopicQuizSchema = new Schema({
    status: {
        type: String,
        enum: ["not_generated", "ready", "passed"],
        default: "not_generated",
    },
    questions: [QuizQuestionSchema],
    attemptCount: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: null },
    cooldownUntil: { type: Date, default: null },
}, { _id: false });

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
    subtopics: [SubtopicSchema],
    notes: { type: String, default: "" },
    completedAt: { type: Date, default: null },
    plannedStartAt: { type: Date, default: null },
    plannedEndAt: { type: Date, default: null },
    paceMinutesPerDay: { type: Number, default: null },
    quiz: { type: TopicQuizSchema, default: () => ({}) },
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
