/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");

const GUEST_USER_ID = "guest-user-001";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing. Add it to .env before seeding.");
}

const subjectSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "book-open" },
    color: { type: String, default: "#3f3f46" },
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

const curriculumSchema = new mongoose.Schema(
  {
    subjectId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    aiGenerated: { type: Boolean, default: false },
    topics: [
      {
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
        resources: [
          {
            title: String,
            url: String,
            type: {
              type: String,
              enum: ["video", "article", "book", "other"],
              default: "article",
            },
          },
        ],
        notes: { type: String, default: "" },
        completedAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

const Subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
const Curriculum =
  mongoose.models.Curriculum || mongoose.model("Curriculum", curriculumSchema);

const seedData = [
  {
    title: "JavaScript Fundamentals",
    description:
      "Build a strong base in modern JavaScript and problem solving.",
    icon: "code-2",
    color: "#3f3f46",
    skillLevel: "beginner",
    tags: ["javascript", "frontend", "programming"],
    topics: [
      {
        title: "Variables, types, and control flow",
        description: "Core language syntax and decision making.",
        estimatedMinutes: 45,
      },
      {
        title: "Functions and scope",
        description: "Function declarations, expressions, and closures.",
        estimatedMinutes: 50,
      },
      {
        title: "Arrays and objects",
        description: "Data modeling with object and array methods.",
        estimatedMinutes: 55,
      },
      {
        title: "Async JavaScript basics",
        description: "Promises, async/await, and common patterns.",
        estimatedMinutes: 60,
      },
    ],
  },
  {
    title: "Data Structures and Algorithms",
    description: "Interview-ready DSA path with practical coding exercises.",
    icon: "database",
    color: "#52525b",
    skillLevel: "intermediate",
    tags: ["dsa", "algorithms", "interview"],
    topics: [
      {
        title: "Big O and complexity analysis",
        description: "Measure and compare algorithm performance.",
        estimatedMinutes: 40,
      },
      {
        title: "Arrays, strings, and hash maps",
        description: "Common patterns: two pointers and sliding window.",
        estimatedMinutes: 70,
      },
      {
        title: "Stacks, queues, and linked lists",
        description: "Linear structures and traversal patterns.",
        estimatedMinutes: 70,
      },
      {
        title: "Trees and graphs",
        description: "DFS, BFS, and practical graph modeling.",
        estimatedMinutes: 80,
      },
      {
        title: "Sorting and binary search",
        description: "Classic methods and optimization strategies.",
        estimatedMinutes: 60,
      },
    ],
  },
  {
    title: "Machine Learning Foundations",
    description:
      "A practical ML roadmap covering math intuition and model workflows.",
    icon: "brain",
    color: "#71717a",
    skillLevel: "intermediate",
    tags: ["machine-learning", "python", "ai"],
    topics: [
      {
        title: "Data preprocessing pipeline",
        description: "Cleaning, encoding, scaling, and train/test split.",
        estimatedMinutes: 60,
      },
      {
        title: "Linear and logistic regression",
        description: "First predictive models and evaluation.",
        estimatedMinutes: 75,
      },
      {
        title: "Model metrics and validation",
        description: "Accuracy, precision, recall, and cross-validation.",
        estimatedMinutes: 65,
      },
      {
        title: "Tree-based models",
        description: "Decision trees and random forests in practice.",
        estimatedMinutes: 80,
      },
    ],
  },
  {
    title: "System Design Essentials",
    description:
      "Learn core architecture concepts for scalable backend systems.",
    icon: "briefcase",
    color: "#27272a",
    skillLevel: "advanced",
    tags: ["system-design", "backend", "architecture"],
    topics: [
      {
        title: "Requirements and capacity estimation",
        description: "Translate product needs into architecture constraints.",
        estimatedMinutes: 50,
      },
      {
        title: "Databases and storage choices",
        description: "SQL vs NoSQL, indexing, and replication basics.",
        estimatedMinutes: 70,
      },
      {
        title: "Caching and message queues",
        description: "Latency optimization and async processing.",
        estimatedMinutes: 70,
      },
      {
        title: "Designing a URL shortener",
        description: "Apply concepts in an end-to-end system design.",
        estimatedMinutes: 90,
      },
    ],
  },
];

function toTopics(topics) {
  return topics.map((topic, index) => ({
    title: topic.title,
    description: topic.description,
    estimatedMinutes: topic.estimatedMinutes,
    actualMinutes: 0,
    status: "todo",
    notes: "",
    completedAt: null,
    order: index,
    resources: [],
  }));
}

async function run() {
  await mongoose.connect(MONGODB_URI);

  let createdSubjects = 0;
  let createdCurriculums = 0;

  for (const item of seedData) {
    let subject = await Subject.findOne({
      userId: GUEST_USER_ID,
      title: item.title,
    });

    if (!subject) {
      subject = await Subject.create({
        userId: GUEST_USER_ID,
        title: item.title,
        description: item.description,
        icon: item.icon,
        color: item.color,
        skillLevel: item.skillLevel,
        tags: item.tags,
        totalTopics: item.topics.length,
        completedTopics: 0,
        totalMinutesSpent: 0,
      });
      createdSubjects += 1;
      console.log(`Created subject: ${item.title}`);
    } else {
      console.log(`Subject exists, skipped: ${item.title}`);
    }

    const existingCurriculum = await Curriculum.findOne({
      userId: GUEST_USER_ID,
      subjectId: subject._id.toString(),
    });

    if (!existingCurriculum) {
      await Curriculum.create({
        userId: GUEST_USER_ID,
        subjectId: subject._id.toString(),
        aiGenerated: false,
        topics: toTopics(item.topics),
      });
      createdCurriculums += 1;
      console.log(`Created curriculum: ${item.title}`);
    } else {
      console.log(`Curriculum exists, skipped: ${item.title}`);
    }

    const totalTopics = await Curriculum.aggregate([
      { $match: { userId: GUEST_USER_ID, subjectId: subject._id.toString() } },
      { $project: { topicCount: { $size: "$topics" } } },
    ]);

    const topicCount = totalTopics[0]?.topicCount ?? item.topics.length;
    await Subject.findByIdAndUpdate(subject._id, { totalTopics: topicCount });
  }

  console.log("");
  console.log(`Seed complete. Subjects created: ${createdSubjects}`);
  console.log(`Seed complete. Curriculums created: ${createdCurriculums}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
