import { createElement } from "react";
import { LucideProps } from "lucide-react";

import { cn } from "@/lib/utils";
import { getAchievementIcon, getMoodIcon, getResourceTypeIcon, getSubjectIcon } from "@/lib/icons";

export function SubjectIcon({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) {
  return createElement(getSubjectIcon(icon), { className: cn("size-4", className) });
}

export function AchievementIcon({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) {
  return createElement(getAchievementIcon(icon), { className: cn("size-5", className) });
}

export function MoodIcon({
  mood,
  className,
  ...props
}: {
  mood?: string | null;
  className?: string;
} & LucideProps) {
  return createElement(getMoodIcon(mood), {
    className: cn("size-4", className),
    ...props,
  });
}

export function ResourceTypeIcon({
  type,
  className,
}: {
  type?: string | null;
  className?: string;
}) {
  return createElement(getResourceTypeIcon(type), { className: cn("size-4", className) });
}
