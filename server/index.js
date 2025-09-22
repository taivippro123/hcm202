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

// 🔑 API Key Gemini (set bằng: export GEMINI_API_KEY="xxxx")
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

// 📌 Endpoint Chatbot
app.post("/chat", async (req, res) => {
    try {
        const { question } = req.body;

        // Tìm đoạn liên quan
        const pieces = findRelevantChunks(question, 5);
        const context = pieces.join("\n\n---\n\n");

        if (!context) {
            return res.json({ answer: "Không tìm thấy trong giáo trình" });
        }

        const prompt = `Bạn là trợ lý chỉ được phép dùng thông tin trong phần TÀI LIỆU dưới đây.\nNếu câu trả lời không nằm trong TÀI LIỆU, hãy trả lời đúng 1 câu: \"Không tìm thấy trong giáo trình\".\n\nTÀI LIỆU:\n${context}\n\nCÂU HỎI:\n${question}\n\nTRẢ LỜI (chỉ dựa trên TÀI LIỆU):`;
        

        const result = await model.generateContent(prompt);
        res.json({ answer: result.response.text() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Endpoint Quiz (1 câu hỏi, 4 đáp án)
app.post("/quiz", async (req, res) => {
    try {
        if (!Array.isArray(chunks) || chunks.length === 0) {
            return res.status(400).json({ error: "Không có dữ liệu giáo trình (chunks.json)" });
        }

        // Lấy ngẫu nhiên một tập các đoạn làm ngữ cảnh
        const take = Math.min(30, chunks.length);
        const shuffled = [...chunks].sort(() => Math.random() - 0.5);
        const context = shuffled.slice(0, take).join("\n\n---\n\n");

        const prompt = `Bạn là hệ thống tạo đề trắc nghiệm. Chỉ dựa trên phần TÀI LIỆU sau đây, hãy tạo RA DANH SÁCH 10 câu hỏi trắc nghiệm, mỗi câu có 4 lựa chọn và đúng 1 đáp án.\n\nYÊU CẦU ĐẦU RA: Trả về DUY NHẤT một mảng JSON gồm 10 phần tử, MỖI PHẦN TỬ có đúng các trường sau:\n- question: string\n- options: array gồm đúng 4 string\n- answer: một trong các ký tự \"A\", \"B\", \"C\", \"D\" (đáp án đúng)\n\nKHÔNG VIẾT THÊM CHÚ THÍCH, VĂN BẢN BÊN NGOÀI JSON.\n\nTÀI LIỆU:\n${context}\n`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Cố gắng trích xuất mảng JSON
        let quizList = null;
        try {
            const arrayMatch = text.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
                quizList = JSON.parse(arrayMatch[0]);
            } else {
                // Thử parse toàn bộ
                quizList = JSON.parse(text);
            }
        } catch (_) {
            quizList = null;
        }

        // Validate sơ bộ
        if (!Array.isArray(quizList) || quizList.length !== 10) {
            return res.json({ error: "Không tạo được danh sách 10 câu hỏi" });
        }

        const normalized = quizList.map((q) => ({
            question: String(q.question || "").trim(),
            options: Array.isArray(q.options) ? q.options.slice(0,4).map(o => String(o)) : [],
            answer: typeof q.answer === "string" ? q.answer.trim().toUpperCase() : ""
        }));

        return res.json(normalized);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🚀 Start server
app.listen(5000, () => {
    console.log("✅ Server running at http://localhost:5000");
});
