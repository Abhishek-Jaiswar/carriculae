import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
    {
        userId: { type: String, required: true, unique: true },
        email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
        passwordHash: { type: String, default: "" },
        name: { type: String, default: "Learner" },
        avatarUrl: { type: String, default: "" },
        dailyGoalMinutes: { type: Number, default: 60 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        totalMinutesLearned: { type: Number, default: 0 },
        lastActiveDate: { type: String, default: null }, // stored as YYYY-MM-DD
        achievements: [{ type: String }],
    },
    { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
