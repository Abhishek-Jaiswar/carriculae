import { Schema, model, models } from "mongoose";

const LearningSessionSchema = new Schema(
    {
        userId: { type: String, required: true, index: true },
        subjectId: { type: String, required: true },
        subjectTitle: { type: String, default: "" },
        topicId: { type: String, required: true },
        topicTitle: { type: String, default: "" },
        durationMinutes: { type: Number, required: true },
        notes: { type: String, default: "" },
        mood: {
            type: String,
            enum: ["great", "good", "okay", "tough"],
            default: "good",
        },
        sessionDate: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
);

export const LearningSession =
    models.LearningSession || model("LearningSession", LearningSessionSchema);
