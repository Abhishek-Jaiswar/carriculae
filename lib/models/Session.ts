import { Schema, model, models } from "mongoose";

const SessionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export const Session = models.Session || model("Session", SessionSchema);
