import { useEffect, useState } from "react";
import API_URL from "../config/api";

export const Quiz = ({ open, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // index -> A/B/C/D
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasCachedQuiz, setHasCachedQuiz] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!open) return;

      // Nếu đã có quiz cached, không cần gọi API lại
      if (hasCachedQuiz) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/quiz`, { method: "POST" });
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
        if (!Array.isArray(data) || data.length === 0) throw new Error("Không lấy được câu hỏi");
        setQuestions(data);
        setHasCachedQuiz(true);
      } catch (e) {
        if (e.message === "quota_exceeded") {
          setError("Dự án sử dụng API miễn phí nên đã hết lượt yêu cầu, vui lòng thử lại sau");
        } else {
          setError("Có lỗi khi tải câu hỏi. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [open, hasCachedQuiz]);

  if (!open) return null;

  const select = (qi, optIndex) => {
    if (submitted) return;
    const letter = ["A","B","C","D"][optIndex];
    setAnswers(prev => ({ ...prev, [qi]: letter }));
  };

  const submit = () => setSubmitted(true);
  const reload = () => {
    // Reset cache và tải quiz mới
    setSubmitted(false);
    setAnswers({});
    setHasCachedQuiz(false);
    setLoading(true);
    setError("");
    fetch(`${API_URL}/quiz`, { method: "POST" })
      .then(res => {
        if (!res.ok) {
          if (res.status === 429) {
            throw new Error("quota_exceeded");
          }
          throw new Error("Yêu cầu thất bại");
        }
        return res.json();
      })
      .then(data => {
        if (data.error && data.error.includes("quota")) {
          throw new Error("quota_exceeded");
        }
        setQuestions(Array.isArray(data) ? data : []);
        setHasCachedQuiz(true);
      })
      .catch((e) => {
        if (e.message === "quota_exceeded") {
          setError("Dự án sử dụng API miễn phí nên đã hết lượt yêu cầu, vui lòng thử lại sau");
        } else {
          setError("Có lỗi khi tải câu hỏi. Vui lòng thử lại.");
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[92vw] max-w-[720px] bg-gradient-to-b from-black/80 to-black/60 border border-white/20 rounded-2xl backdrop-blur-xl p-4 md:p-6 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Mini Quiz</h3>
          <div className="flex items-center gap-2">
            {hasCachedQuiz && !submitted && (
              <button 
                className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                onClick={reload}
                disabled={loading}
              >
                {loading ? "Đang tải..." : "Tải mới"}
              </button>
            )}
            <button className="text-white/80 hover:text-white" onClick={onClose}>✕</button>
          </div>
        </div>
        {error && <div className="mb-2 text-xs text-red-300">{error}</div>}
        {loading ? (
          <div className="py-8 text-center text-white/80">Đang tải 10 câu hỏi không trùng nhau...</div>
        ) : (
          <>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {questions.map((q, qi) => (
                <div key={qi} className="rounded-xl border border-white/20 p-3">
                  <p className="mb-2 text-base">{qi + 1}. {q.question}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options?.slice(0,4).map((opt, oi) => {
                      const letter = ["A","B","C","D"][oi];
                      const chosen = answers[qi] === letter;
                      const correct = submitted && q.answer === letter;
                      const wrong = submitted && chosen && q.answer !== letter;
                      return (
                        <button
                          key={oi}
                          className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                            correct ? "bg-green-500/20 border-green-400" :
                            wrong ? "bg-red-500/20 border-red-400" :
                            chosen ? "bg-white/20 border-white font-semibold ring-2 ring-white/60" :
                            "bg-white/5 border-white/20 hover:bg-white/10"}
                          `}
                          onClick={() => select(qi, oi)}
                        >
                          {letter}. {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              {!submitted ? (
                <button
                  className="px-4 py-2 rounded-xl bg-white text-black"
                  onClick={submit}
                  disabled={questions.length === 0}
                >
                  Nộp bài
                </button>
              ) : (
                <>
                  <span className="flex-1 text-white/80">
                    Đúng {Object.entries(answers).filter(([i, a]) => questions[Number(i)]?.answer === a).length}/{questions.length}
                  </span>
                  <button className="px-4 py-2 rounded-xl bg-white text-black" onClick={reload}>Làm bộ khác</button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;

