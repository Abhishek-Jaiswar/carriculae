import { redirect } from "next/navigation";

export default function LegacyAchievementsRedirect() {
  redirect("/dashboard/achievements");
}
