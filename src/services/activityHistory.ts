export type ActivityType =
  | "audit"
  | "keyword_research"
  | "content_check"
  | "content_write"
  | "ai_overview"
  | "schema"
  | "strategy_plan"
  | "off_page"
  | "on_page";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  title: string;
  detail?: string;
  createdAt: string;
}

const ACTIVITY_HISTORY_KEY = "activityHistory";

export function getActivityHistory(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addActivity(entry: Omit<ActivityEntry, "id" | "createdAt">) {
  const previous = getActivityHistory();
  const next: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };

  const updated = [next, ...previous].slice(0, 100);
  localStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function clearActivityHistory() {
  localStorage.removeItem(ACTIVITY_HISTORY_KEY);
}
