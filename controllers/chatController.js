const fs = require("fs");
const path = require("path");
const openai = require("../config/openaiConfig");

// Load FAQ data
const faqPath = path.join(__dirname, "../data/faq.json");
const faqData = JSON.parse(fs.readFileSync(faqPath, "utf-8"));

// Stopwords for keyword extraction
const stopwords = [
  "is", "the", "a", "an", "of", "in", "on", "for", "how", "can", "what", "where", "who", "are", "to"
];

// Helper: Extract keywords safely
function extractKeywords(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .split(" ")
    .filter(word => word && !stopwords.includes(word));
}

// Helper: keyword overlap
function keywordMatchScore(msgKeywords, faqKeywords) {
  const matches = faqKeywords.filter(k => msgKeywords.includes(k));
  return matches.length;
}

// Main chat handler
exports.handleChat = async (req, res) => {
  try {
    const { message, question } = req.body;
    const userInput = message || question;

    if (!userInput || typeof userInput !== "string") {
      return res.status(400).json({ reply: "Please ask a valid question." });
    }

    console.log("📩 User asked:", userInput);

    const msgKeywords = extractKeywords(userInput);

    // 1️⃣ Find the FAQ with most keyword overlap
    let bestMatch = null;
    let highestScore = 0;

    faqData.forEach(faq => {
      const faqKeywords = extractKeywords(faq.question);
      const score = keywordMatchScore(msgKeywords, faqKeywords);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    });

    // 2️⃣ If FAQ found
    if (highestScore > 0) {
      console.log("✅ Answered from FAQ");
      return res.json({ reply: bestMatch.answer });
    }

    // 3️⃣ Otherwise, fallback to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful student helpdesk assistant for a college campus. If the question is not in FAQ data, reply generally but relevant to campus life."
        },
        { role: "user", content: userInput }
      ]
    });

    const botReply = completion.choices[0].message.content;
    console.log("🤖 OpenAI reply:", botReply);

    res.json({ reply: botReply });
  } catch (err) {
    console.error("❌ Chat Error:", err);
    res.status(500).json({ reply: "Something went wrong on the server." });
  }
};
