import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { apiRequest } from "../services/apiClient";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

export default function InstantSEOChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Hi! I am InstantSEOScan assistant. Ask me anything about SEO, content, or technical audit.",
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const sendMessage = async () => {
    if (!canSend) return;

    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    const result = await apiRequest<{ reply?: string }>("/api/ai/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    setLoading(false);

    if (!result.ok) {
      setMessages((prev) => [...prev, { role: "bot", text: result.error || "Chat service unavailable." }]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "bot", text: String(result.data?.reply || "I could not generate a response.") },
    ]);
  };

  const quickPrompts = [
    "Audit my homepage SEO",
    "Write meta title + description",
    "Give 5 long-tail keywords",
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[120]">
      {open && (
        <div className="w-[460px] max-w-[calc(100vw-1rem)] h-[640px] max-h-[82vh] bg-white border border-neutral-200 shadow-2xl rounded-3xl mb-3 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div>
                <h3 className="font-semibold text-sm text-neutral-900 leading-tight">InstantSEOScan Assistant</h3>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mt-0.5">generate by instanseoscan ai</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-neutral-200">
              <X size={16} />
            </button>
          </div>

          <div className="px-4 pt-3 pb-2 border-b border-neutral-200 bg-white">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-100/60">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`max-w-[92%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed border ${
                  msg.role === "user"
                    ? "ml-auto bg-neutral-900 text-white border-neutral-900 shadow-sm"
                    : "mr-auto bg-white text-neutral-800 border-neutral-200"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="mr-auto inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-neutral-200 text-neutral-700 text-xs">
                <span>InstantSEOScan AI is typing</span>
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:240ms]" />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-neutral-200 bg-white flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask SEO question..."
              rows={2}
              className="flex-1 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-neutral-300 resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={!canSend}
              className="p-2.5 rounded-xl bg-neutral-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="ml-auto flex items-center gap-2 px-4 py-3 rounded-full bg-neutral-900 text-white font-semibold shadow-xl hover:bg-black"
      >
        <MessageCircle size={18} />
        Ask AI
      </button>
    </div>
  );
}
