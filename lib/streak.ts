import { User } from "@/lib/models/User";
import { Subject } from "@/lib/models/Subject";

const ACHIEVEMENTS = [
    { id: "first_session", condition: (sessions: number) => sessions >= 1 },
    { id: "streak_3", condition: (_: number, streak: number) => streak >= 3 },
    { id: "streak_7", condition: (_: number, streak: number) => streak >= 7 },
    { id: "streak_30", condition: (_: number, streak: number) => streak >= 30 },
    { id: "night_owl", condition: (sessions: number) => sessions >= 10 },
    { id: "bookworm", condition: (sessions: number, _: number, subjects: number) => subjects >= 5 },
];

export async function updateStreakAndAchievements(
    userId: string,
    minutesSpent: number,
    subjectId: string
) {
    const today = new Date().toISOString().split("T")[0];

    const user = await User.findOneAndUpdate(
        { userId },
        {},
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    const last = user.lastActiveDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = user.currentStreak;
    if (last === today) {
        // already studied today — no streak change
    } else if (last === yesterdayStr) {
        newStreak = user.currentStreak + 1;
    } else {
        newStreak = 1;
    }

    const newLongest = Math.max(newStreak, user.longestStreak);
    const newTotal = user.totalMinutesLearned + minutesSpent;

    // Count user subjects for bookworm achievement
    const subjectCount = await Subject.countDocuments({ userId });

    // Check achievements
    const earned = [...(user.achievements || [])] as string[];
    for (const ach of ACHIEVEMENTS) {
        if (!earned.includes(ach.id) && ach.condition(newTotal / 30, newStreak, subjectCount)) {
            earned.push(ach.id);
        }
    }

    const updated = await User.findOneAndUpdate(
        { userId },
        {
            currentStreak: newStreak,
            longestStreak: newLongest,
            totalMinutesLearned: newTotal,
            lastActiveDate: today,
            achievements: earned,
        },
        { returnDocument: "after" }
    );

    // Update subject time
    await Subject.findByIdAndUpdate(subjectId, {
        $inc: { totalMinutesSpent: minutesSpent },
        lastStudiedAt: new Date(),
    });

    return updated;
}
