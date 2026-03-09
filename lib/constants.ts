// Shared guest user ID for single-user mode (no auth)
export const GUEST_USER_ID = "guest-user-001";

// Achievement definitions
export const ACHIEVEMENTS = [
  {
    id: "first_session",
    title: "First Step",
    description: "Complete your very first learning session",
    icon: "rocket",
  },
  {
    id: "streak_3",
    title: "3-Day Streak",
    description: "Study for 3 days in a row",
    icon: "flame",
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Study for 7 days in a row",
    icon: "zap",
  },
  {
    id: "streak_30",
    title: "Monthly Master",
    description: "Study for 30 days in a row",
    icon: "trophy",
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Log 10 or more learning sessions",
    icon: "moon",
  },
  {
    id: "bookworm",
    title: "Bookworm",
    description: "Create 5 or more subjects",
    icon: "book-open",
  },
  {
    id: "ai_explorer",
    title: "AI Explorer",
    description: "Generate a curriculum using AI",
    icon: "bot",
  },
  {
    id: "speed_learner",
    title: "Speed Learner",
    description: "Complete a topic faster than estimated",
    icon: "gauge",
  },
];

export const SKILL_LEVELS = ["beginner", "intermediate", "advanced"] as const;

export const MOODS = [
  { value: "great", label: "Great", color: "#10b981" },
  { value: "good", label: "Good", color: "#6366f1" },
  { value: "okay", label: "Okay", color: "#f59e0b" },
  { value: "tough", label: "Tough", color: "#ef4444" },
] as const;

export const SUBJECT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
];

export const SUBJECT_ICONS = [
  "book-open",
  "code-2",
  "palette",
  "brain",
  "sigma",
  "message-square",
  "globe",
  "dumbbell",
  "chart-column",
  "target",
  "pencil",
  "rocket",
  "sparkles",
  "database",
  "briefcase",
  "bot",
] as const;
