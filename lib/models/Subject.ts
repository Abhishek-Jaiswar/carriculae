import { Schema, model, models } from "mongoose";

const SubjectSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "book-open" },
    color: { type: String, default: "#6366f1" },
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    tags: [{ type: String }],
    totalTopics: { type: Number, default: 0 },
    completedTopics: { type: Number, default: 0 },
    totalMinutesSpent: { type: Number, default: 0 },
    lastStudiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Subject = models.Subject || model("Subject", SubjectSchema);
