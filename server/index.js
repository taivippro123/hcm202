import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔑 Load multiple API Keys for load balancing
const apiKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6
].filter(key => key && key.trim() !== ''); // Filter out empty/undefined keys

if (apiKeys.length === 0) {
    console.error("❌ No valid API keys found! Please set at least one GEMINI_API_KEY_X");
    process.exit(1);
}

console.log(`✅ Loaded ${apiKeys.length} API keys for load balancing`);

// Round-robin counter for even distribution
let currentKeyIndex = 0;

// 🔄 Key selection strategies
function getRandomKey() {
    return apiKeys[Math.floor(Math.random() * apiKeys.length)];
}

function getRoundRobinKey() {
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return key;
}

// 🎯 Get AI model instance with selected key
function getAIModel(key) {
    const genAI = new GoogleGenerativeAI(key);
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

// 📂 Load chunks.json (robust path)
let chunks = [];
try {
    const byCwd = path.join(process.cwd(), "server", "chunks.json");
    const byLocal = path.join(process.cwd(), "chunks.json");
    const targetPath = fs.existsSync(byCwd) ? byCwd : byLocal;
    chunks = JSON.parse(fs.readFileSync(targetPath, "utf8"));
    if (!Array.isArray(chunks)) {
        chunks = [];
    }
} catch (e) {
    chunks = [];
}

// 📚 Load quiz bank from quiz.json (robust path)
let quizBank = [];
try {
    const byCwd = path.join(process.cwd(), "server", "quiz.json");
    const byLocal = path.join(process.cwd(), "quiz.json");
    const quizPath = fs.existsSync(byCwd) ? byCwd : byLocal;
    const raw = fs.readFileSync(quizPath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
        quizBank = parsed;
    } else if (Array.isArray(parsed?.questions)) {
        quizBank = parsed.questions;
    }
} catch (e) {
    quizBank = [];
}

// 🔎 Tìm chunk liên quan (chấm điểm theo từ khóa, có fallback)
function normalize(text) {
    return text
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[^a-zà-ỹ0-9\s]/gi, " ");
}

const STOPWORDS = new Set([
    "và","là","của","cho","các","những","về","trong","được","một","có","hay","hoặc","như","khi","đến","từ","với","theo","này","đó","nên","thì","đã","sẽ"
]);

function tokenize(text) {
    return normalize(text)
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function scoreChunk(tokens, chunkText) {
    const t = normalize(chunkText);
    let score = 0;
    for (const tok of tokens) {
        if (t.includes(tok)) score += 1;
    }
    return score;
}

function findRelevantChunks(question, limit = 5) {
    if (!Array.isArray(chunks) || chunks.length === 0) return [];
    const tokens = tokenize(question);
    if (tokens.length === 0) return chunks.slice(0, limit);
    const scored = chunks
        .map(c => ({ c, score: typeof c === "string" ? scoreChunk(tokens, c) : 0 }))
        .filter(x => x.score > 0);
    if (scored.length === 0) return chunks.slice(0, limit);
    return scored.sort((a,b) => b.score - a.score).slice(0, limit).map(x => x.c);
}

// 📌 Endpoint Chatbot with load balancing
app.post("/chat", async (req, res) => {
    const { question } = req.body;
    let lastError = null;

    // Try each API key until one succeeds
    for (let attempt = 0; attempt < apiKeys.length; attempt++) {
        try {
            // Use round-robin for even distribution, fallback to random if needed
            const selectedKey = getRoundRobinKey();
            const model = getAIModel(selectedKey);
            
            console.log(`🔄 Using API key ${attempt + 1}/${apiKeys.length} for chat request`);

            // Tìm đoạn liên quan
            const pieces = findRelevantChunks(question, 10).filter(Boolean);
            let context = pieces.join("\n\n---\n\n");

            // Fallback: nếu không tìm thấy trong chunks, thử dùng ngân hàng quiz để hỗ trợ ngữ cảnh
            if (!context && Array.isArray(quizBank) && quizBank.length > 0) {
                // Chọn 10 câu hỏi trong quiz gần với câu hỏi của user
                const tokens = tokenize(question);
                const scored = quizBank
                    .map((q) => ({
                        q,
                        score: scoreChunk(tokens, `${q.question}\n${Array.isArray(q.options) ? q.options.join(" ") : ""}`),
                    }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10)
                    .map((x) => x.q)
                    .filter((x) => x && typeof x.question === "string");

                if (scored.length > 0) {
                    const quizContext = scored
                        .map((q, idx) => `Q${idx + 1}: ${q.question}\nOptions: ${(q.options || []).join(" | ")}\nAnswer: ${q.answer}`)
                        .join("\n\n---\n\n");
                    context = `Tư liệu tham khảo từ ngân hàng câu hỏi:\n\n${quizContext}`;
                }
            }

            if (!context) {
                return res.json({ answer: "Không tìm thấy trong giáo trình" });
            }

            const prompt = `Bạn là trợ lý chỉ được phép dùng thông tin trong phần TÀI LIỆU dưới đây.\nNếu câu trả lời không nằm trong TÀI LIỆU, hãy trả lời đúng 1 câu: \"Không tìm thấy trong giáo trình\".\n\nTÀI LIỆU:\n${context}\n\nCÂU HỎI:\n${question}\n\nTRẢ LỜI (chỉ dựa trên TÀI LIỆU):`;
            
            const result = await model.generateContent(prompt);
            console.log(`✅ Chat request successful with API key ${attempt + 1}`);
            return res.json({ answer: result.response.text() });

        } catch (err) {
            lastError = err;
            console.error(`❌ API key ${attempt + 1} failed:`, err.message);
            
            // If it's a quota error, try next key immediately
            if (err.message.includes("429") || err.message.includes("quota")) {
                console.log(`🔄 Quota exceeded for key ${attempt + 1}, trying next key...`);
                continue;
            }
            
            // For other errors, also try next key
            if (attempt < apiKeys.length - 1) {
                console.log(`🔄 Error with key ${attempt + 1}, trying next key...`);
                continue;
            }
        }
    }

    // All keys failed
    console.error("❌ All API keys failed");
    if (lastError && (lastError.message.includes("429") || lastError.message.includes("quota"))) {
        return res.status(429).json({ 
            error: "All API quotas exceeded. Please try again later.",
            retryAfter: 3600 // 1 hour
        });
    }
    
    return res.status(500).json({ 
        error: lastError ? lastError.message : "All API keys failed" 
    });
});

// 📌 Endpoint Quiz: lấy ngẫu nhiên 10 câu từ quiz.json, không gọi AI
app.post("/quiz", async (_req, res) => {
    try {
        if (!Array.isArray(quizBank) || quizBank.length < 4) {
            return res.status(400).json({ error: "Không có dữ liệu quiz (quiz.json)" });
        }
        const pool = [...quizBank];
        // shuffle Fisher–Yates
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const take = Math.min(10, pool.length);
        const picked = pool.slice(0, take);
        const normalized = picked.map((q) => ({
            question: String(q.question || "").trim(),
            options: Array.isArray(q.options) ? q.options.slice(0, 4).map((o) => String(o)) : [],
            answer: typeof q.answer === "string" ? q.answer.trim().toUpperCase() : ""
        }));
        return res.json(normalized);
    } catch (err) {
        console.error("Quiz endpoint error:", err?.message || err);
        return res.status(500).json({ error: "Quiz service failed" });
    }
});

// 🚀 Start server
app.listen(5000, () => {
    console.log("✅ Server running at http://localhost:5000");
});
