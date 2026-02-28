import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { NON_JSON_API_EVENT } from "../services/apiClient";

type BannerState = {
  visible: boolean;
  path: string;
};

export default function ApiStatusBanner() {
  const [banner, setBanner] = useState<BannerState>({ visible: false, path: "" });

  useEffect(() => {
    const onNonJson = (event: Event) => {
      const customEvent = event as CustomEvent<{ path?: string }>;
      setBanner({
        visible: true,
        path: customEvent.detail?.path || "/api",
      });
    };

    window.addEventListener(NON_JSON_API_EVENT, onNonJson);
    return () => window.removeEventListener(NON_JSON_API_EVENT, onNonJson);
  }, []);

  if (!banner.visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[min(92vw,760px)] bg-amber-50 border border-amber-200 text-amber-900 rounded-xl shadow-lg px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <div className="text-sm leading-relaxed">
          <div className="font-bold">Backend unavailable or API proxy mismatch</div>
          <div>
            Received a non-JSON response from <span className="font-mono">{banner.path}</span>. Ensure the backend server is running and <span className="font-mono">/api</span> proxy points to port <span className="font-mono">3000</span>.
          </div>
        </div>
        <button
          onClick={() => setBanner((prev) => ({ ...prev, visible: false }))}
          className="ml-auto p-1 rounded-md hover:bg-amber-100 transition-colors"
          aria-label="Dismiss API status banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
