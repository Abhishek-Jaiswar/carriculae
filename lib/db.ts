import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null };
}

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    const conn = await mongoose.connect(MONGODB_URI!);
    cached.conn = conn;
    return conn;
}