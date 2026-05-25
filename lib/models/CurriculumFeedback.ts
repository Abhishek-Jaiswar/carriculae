import { Schema, model, models } from "mongoose";

const CurriculumFeedbackSchema = new Schema(
    {
        userId: { type: String, required: true, index: true },
        subjectId: { type: String, required: true, index: true },
        topicId: { type: String, default: "" },
        targetType: {
            type: String,
            enum: ["topic", "resource", "curriculum"],
            default: "topic",
        },
        resourceUrl: { type: String, default: "" },
        sentiment: {
            type: String,
            enum: ["up", "down", "issue"],
            required: true,
        },
        note: { type: String, default: "", maxlength: 2000 },
    },
    { timestamps: true }
);

export const CurriculumFeedback =
    models.CurriculumFeedback || model("CurriculumFeedback", CurriculumFeedbackSchema);
