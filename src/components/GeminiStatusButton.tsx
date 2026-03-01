import { useState } from "react";
import { apiRequest } from "../services/apiClient";

type Status = "idle" | "ok" | "error" | "checking";

export default function GeminiStatusButton() {
  const [status, setStatus] = useState<Status>("idle");

  const checkStatus = async () => {
    setStatus("checking");
    try {
      const res = await apiRequest<any>("/api/ai/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "health" }),
      });
      setStatus(res?.data?.message === "API working" ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  };

  const dotClass =
    status === "ok"
      ? "bg-emerald-500"
      : status === "error"
        ? "bg-red-500"
        : status === "checking"
          ? "bg-amber-500"
          : "bg-neutral-400";

  return (
    <button
      onClick={checkStatus}
      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
      title="Check Gemini API status"
    >
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      Gemini API {status === "checking" ? "Checking..." : "Status"}
    </button>
  );
}
