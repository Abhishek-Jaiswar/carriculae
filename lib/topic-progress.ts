type TopicLike = {
  _id?: unknown;
  order?: number;
  status?: string;
};

export function sortTopicsByOrder<T extends TopicLike>(topics: T[]): T[] {
  return [...topics].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getFirstIncompleteTopicId<T extends TopicLike>(topics: T[]): string | null {
  const first = sortTopicsByOrder(topics).find((topic) => topic.status !== "done");
  return first?._id ? String(first._id) : null;
}

export function isTopicUnlocked<T extends TopicLike>(topics: T[], topicId: string): boolean {
  const firstIncompleteId = getFirstIncompleteTopicId(topics);
  const topic = topics.find((t) => String(t._id) === topicId);
  if (!topic) return false;

  if (topic.status === "done") return true;
  if (!firstIncompleteId) return false;
  return firstIncompleteId === topicId;
}
