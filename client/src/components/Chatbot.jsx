import { useState, useRef, useEffect } from "react";
import API_URL from "../config/api";

const ChatMessage = ({ role, content }) => {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm md:text-base shadow-md ${
          role === "user" ? "bg-white text-black" : "bg-black/70 text-white"
        }`}
      >
        {content}
      </div>
    </div>
  );
};

export const Chatbot = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Xin chào! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  if (!open) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("quota_exceeded");
        }
        throw new Error("Yêu cầu thất bại");
      }
      const data = await res.json();
      if (data.error && data.error.includes("quota")) {
        throw new Error("quota_exceeded");
      }
      const answer = data?.answer || "Không tìm thấy trong giáo trình";
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      if (e.message === "quota_exceeded") {
        setError("Dự án sử dụng API miễn phí nên đã hết lượt yêu cầu, vui lòng thử lại sau");
        setMessages((prev) => [...prev, { role: "assistant", content: "Dự án sử dụng API miễn phí nên đã hết lượt yêu cầu, vui lòng thử lại sau" }]);
      } else {
        setError("Có lỗi khi gọi API. Vui lòng thử lại.");
        setMessages((prev) => [...prev, { role: "assistant", content: "Xin lỗi, có lỗi xảy ra." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full md:w-[520px] h-[70vh] md:h-[70vh] bg-gradient-to-b from-black/80 to-black/60 border border-white/20 rounded-t-2xl md:rounded-2xl backdrop-blur-xl p-3 md:p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold">Chatbot</h3>
          <button className="text-white/80 hover:text-white" onClick={onClose}>✕</button>
        </div>
        {error && (
          <div className="mb-2 text-xs text-red-300">{error}</div>
        )}
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 bg-white/90 text-black rounded-xl px-3 py-2 text-sm md:text-base outline-none"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={loading}
          />
          <button
            className="bg-white text-black rounded-xl px-3 py-2 text-sm md:text-base hover:bg-white/90 disabled:opacity-60"
            onClick={send}
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

