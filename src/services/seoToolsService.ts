import { apiRequest } from "./apiClient";

export async function getKeywordRank(payload: { keyword: string; domain: string; country: string; email?: string }) {
  const res = await apiRequest<any>("/api/seo/keyword-rank", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok || !res.data) throw new Error(res.error || "Failed to fetch keyword rank data");
  return res.data;
}

export async function getSerpComparison(payload: { keywordA: string; keywordB: string; country: string }) {
  const res = await apiRequest<any>("/api/seo/serp-compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok || !res.data) throw new Error(res.error || "Failed to compare SERP data");
  return res.data;
}

export async function getCannibalization(payload: { domain: string; keyword: string }) {
  const res = await apiRequest<any>("/api/seo/cannibalization", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok || !res.data) throw new Error(res.error || "Failed to detect cannibalization");
  return res.data;
}

export async function getIntentAnalysis(payload: { keyword: string; country: string }) {
  const res = await apiRequest<any>("/api/seo/intent-analyzer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok || !res.data) throw new Error(res.error || "Failed to analyze SERP intent");
  return res.data;
}

export async function getSerpDatabase(payload: { keyword: string; country: string; email?: string }) {
  const res = await apiRequest<any>("/api/seo/serp-database", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok || !res.data) throw new Error(res.error || "Failed to load SERP database");
  return res.data;
}

export async function getStatisticsPage(slug: string) {
  const res = await apiRequest<any>(`/api/seo/statistics/${encodeURIComponent(slug)}`);
  if (!res.ok || !res.data) throw new Error(res.error || "Failed to load statistics");
  return res.data;
}

export async function getProgrammaticData(kind: string, keyword: string) {
  const res = await apiRequest<any>(`/api/seo/programmatic/${encodeURIComponent(kind)}/${encodeURIComponent(keyword)}`);
  if (!res.ok || !res.data) throw new Error(res.error || "Failed to load programmatic SEO data");
  return res.data;
}
