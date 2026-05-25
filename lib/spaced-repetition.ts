import { addDays } from "date-fns";

/** Days until first review after passing a topic quiz. */
export const DAYS_AFTER_PASS = 1;

/**
 * After each completed review session, schedule the next review using expanding intervals.
 * Index aligns with (reviewLevel - 1) after a review is marked complete.
 */
export const INTERVALS_AFTER_REVIEW_DAYS = [3, 7, 14, 30, 30] as const;

export function nextReviewAfterPass(now = new Date()) {
  return {
    reviewLevel: 1,
    nextReviewAt: addDays(now, DAYS_AFTER_PASS),
  };
}

export function nextScheduleAfterReviewComplete(
  currentReviewLevel: number,
  now = new Date()
): { reviewLevel: number; nextReviewAt: Date } {
  const level = Math.max(1, currentReviewLevel);
  const idx = Math.min(level - 1, INTERVALS_AFTER_REVIEW_DAYS.length - 1);
  const days = INTERVALS_AFTER_REVIEW_DAYS[idx];
  return {
    reviewLevel: level + 1,
    nextReviewAt: addDays(now, days),
  };
}
