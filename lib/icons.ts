import {
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  ChartColumn,
  Code2,
  Database,
  Dumbbell,
  FileText,
  Flame,
  Gauge,
  Globe,
  LucideIcon,
  MessageSquare,
  Moon,
  Palette,
  Pencil,
  Rocket,
  Sigma,
  Sparkles,
  Target,
  Trophy,
  Video,
  Zap,
} from "lucide-react";

export const subjectIconMap = {
  "book-open": BookOpen,
  "code-2": Code2,
  palette: Palette,
  brain: Brain,
  sigma: Sigma,
  "message-square": MessageSquare,
  globe: Globe,
  dumbbell: Dumbbell,
  "chart-column": ChartColumn,
  target: Target,
  pencil: Pencil,
  rocket: Rocket,
  sparkles: Sparkles,
  database: Database,
  briefcase: Briefcase,
  bot: Bot,
} as const;

export type SubjectIconKey = keyof typeof subjectIconMap;
export const DEFAULT_SUBJECT_ICON: SubjectIconKey = "book-open";

const legacySubjectIconMap: Record<string, SubjectIconKey> = {
  js: "code-2",
  ds: "database",
  ml: "brain",
  sd: "briefcase",
};

export function resolveSubjectIconKey(value?: string | null): SubjectIconKey {
  if (!value) return DEFAULT_SUBJECT_ICON;

  const normalized = value.toLowerCase().trim();
  if (normalized in subjectIconMap) {
    return normalized as SubjectIconKey;
  }

  if (normalized in legacySubjectIconMap) {
    return legacySubjectIconMap[normalized];
  }

  return DEFAULT_SUBJECT_ICON;
}

export function getSubjectIcon(value?: string | null): LucideIcon {
  const key = resolveSubjectIconKey(value);
  return subjectIconMap[key];
}

export const achievementIconMap = {
  rocket: Rocket,
  flame: Flame,
  zap: Zap,
  trophy: Trophy,
  moon: Moon,
  "book-open": BookOpen,
  bot: Bot,
  gauge: Gauge,
} as const;

export type AchievementIconKey = keyof typeof achievementIconMap;
export const DEFAULT_ACHIEVEMENT_ICON: AchievementIconKey = "trophy";

export function getAchievementIcon(value?: string | null): LucideIcon {
  if (!value) return achievementIconMap[DEFAULT_ACHIEVEMENT_ICON];
  const normalized = value.toLowerCase().trim();
  if (normalized in achievementIconMap) {
    return achievementIconMap[normalized as AchievementIconKey];
  }
  return achievementIconMap[DEFAULT_ACHIEVEMENT_ICON];
}

export const moodIconMap = {
  great: Sparkles,
  good: BookOpen,
  okay: Target,
  tough: Flame,
} as const;

export function getMoodIcon(value?: string | null): LucideIcon {
  const normalized = (value || "good").toLowerCase().trim();
  return moodIconMap[normalized as keyof typeof moodIconMap] || moodIconMap.good;
}

export function getResourceTypeIcon(type?: string | null): LucideIcon {
  const normalized = (type || "article").toLowerCase().trim();
  if (normalized === "video") return Video;
  if (normalized === "book") return BookOpen;
  return FileText;
}
