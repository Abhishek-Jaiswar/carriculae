# Carriculae — product metrics

This document defines the **2–3 primary metrics** we use to steer features and measure whether the app improves real learning outcomes.

## 1. Engagement (habit strength)

**Definition:** Consistent study behavior over time.

**Primary KPI:** **Sessions in the last 7 days** — count of `LearningSession` documents with `sessionDate` in the rolling 7-day window.

**Supporting signals:**

- Minutes logged in the last 7 days.
- Current streak (`User.currentStreak`).

**Why:** Without regular sessions, curriculum and quizzes do not compound into skill.

---

## 2. Completion (progress through the path)

**Definition:** Learners advance through their planned curriculum, not only log time.

**Primary KPI:** **Topics completed** — sum of `Subject.completedTopics` for the user (each reflects a topic marked `done` after a passed quiz).

**Supporting signals:**

- Subject-level completion ratio (`completedTopics / totalTopics`).
- Total subjects with at least one completed topic.

**Why:** Time alone does not prove mastery of a structured path; topic completion ties effort to the AI-generated plan.

---

## 3. Assessment quality (honest checks)

**Definition:** Quizzes are used meaningfully, and reflections/confidence support self-calibration.

**Primary KPI:** **Quiz pass rate (first-attempt optional; we track aggregate passes / attempts)** — `User.quizPasses` / `User.quizAttempts` (updated on each quiz submission).

**Supporting signals (product):**

- Optional **confidence before quiz** (1–5) stored when a quiz is passed.
- Optional **short reflection** after a passed quiz.

**Why:** A high pass rate with consistently low pre-quiz confidence may indicate the need for better prerequisites or content; low pass rate may indicate difficulty or cramming.

---

## How these appear in the app

- **`GET /api/progress`** returns a `metrics` object aligned with the above KPIs for the authenticated user.
- The **Progress** dashboard surfaces these values so learners (and future admins) can see them without a separate analytics tool.

---

## Future instrumentation (not required for v1)

- Funnel: signup → first subject → first generation → first session → first quiz pass.
- Cohort retention by week.
- Export or webhook to a BI tool for mentors/classroom plans.
