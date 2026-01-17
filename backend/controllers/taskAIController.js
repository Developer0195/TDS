// const OpenAI = require("openai");

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// const generateTaskUsingAI = async (req, res) => {
//     try {
//         const { title, fileText } = req.body;

//         if (!title && !fileText) {
//             return res.status(400).json({
//                 message: "Title or file content required",
//             });
//         }

//         const prompt = `
// You are a task management assistant.

// Generate a task in STRICT JSON format.

// Input:
// ${title ? `Title: ${title}` : ""}
// ${fileText ? `File Content: ${fileText}` : ""}

// Rules:
// - JSON ONLY
// - No markdown
// - No explanation

// Format:
// {
//   "title": "",
//   "description": "",
//   "priority": "Low | Medium | High",
//   "todoCheckList": []
// }
// `;

//         const response = await openai.chat.completions.create({
//             model: "gpt-4o-mini",
//             messages: [{ role: "user", content: prompt }],
//             temperature: 0.2,
//         });

//         const aiResult = JSON.parse(
//             response.choices[0].message.content
//         );

//         res.status(200).json(aiResult);
//     } catch (error) {
//         console.error("AI ERROR:", error);
//         res.status(500).json({
//             message: "AI task generation failed",
//         });
//     }
// };

// module.exports = { generateTaskUsingAI };


const { GoogleGenerativeAI } = require("@google/generative-ai");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* -------------------- HELPERS -------------------- */

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "task-files", resource_type: "auto" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

const extractTextFromFile = async (file) => {
    if (!file) return "";

    if (file.mimetype === "application/pdf") {
        const data = await pdf(file.buffer);
        return data.text;
    }

    if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        return result.value;
    }

    if (file.mimetype === "text/plain") {
        return file.buffer.toString("utf-8");
    }

    return "";
};

/* -------------------- CONTROLLER -------------------- */

const generateTaskUsingAI = async (req, res) => {
    try {
        const { title } = req.body;
        let fileText = "";
        let fileUrl = "";

        // ✅ Handle file if present
        if (req.file) {
            // 1️⃣ Upload to Cloudinary
            const uploaded = await uploadToCloudinary(req.file.buffer);
            fileUrl = uploaded.secure_url;

            // 2️⃣ Extract text for AI
            fileText = await extractTextFromFile(req.file);
        }

        if (!title && !fileText) {
            return res.status(400).json({
                message: "Title or file required",
            });
        }

        const prompt = `
You are a senior project manager.

Your job is to break work into ACTIONABLE subtasks.

Generate a task in STRICT JSON format.

INPUT INFORMATION:
${title ? `Task Title Hint: ${title}` : ""}
${fileText ? `Reference Document Content:\n${fileText.slice(0, 3000)}` : ""}

VERY IMPORTANT RULES:
- todoCheckList MUST contain at least 5 items
- Each todo must be a clear ACTION (verb-based)
- Do NOT summarize
- Do NOT merge steps
- Think like a project breakdown (WBS)

Return ONLY valid JSON.
No markdown.
No explanation.

JSON FORMAT:
{
  "title": "Short actionable task title",
  "description": "2–3 sentence overview of what needs to be done",
  "priority": "Low | Medium | High",
  "todoCheckList": [
    "Action step 1",
    "Action step 2",
    "Action step 3",
    "Action step 4",
    "Action step 5"
  ]
}
`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", // ✅ FREE & STABLE
        });

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        // 🔥 Clean Gemini formatting
        responseText = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(responseText);

        res.status(200).json({
            ...parsed,
            fileUrl, // 👈 return hosted file link
        });
    } catch (error) {
        console.error("Gemini AI Error:", error.message);

        res.status(500).json({
            message: "Gemini task generation failed",
        });
    }
};


const estimateTaskUsingAI = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            checklistCount,
            assignedTo,
            hasHistoricalData = false,
        } = req.body;

        const today = new Date().toISOString().split("T")[0];

        if (
            !title ||
            !description ||
            !priority ||
            !checklistCount ||
            !Array.isArray(assignedTo) ||
            assignedTo.length === 0
        ) {
            return res.status(400).json({
                message: "Insufficient data for AI estimation",
            });
        }

        const prompt = `
You are a senior project manager.

Your task is to ESTIMATE effort and timeline.
You are providing ADVISORY guidance only.

CRITICAL CONTEXT:
- Today's date is ${today}.
- Suggested due date MUST be in the FUTURE.
- NEVER return a past date.

IMPORTANT:
- This is a NEW system.
- There is ${hasHistoricalData ? "" : "NO"} organization-specific historical data.
- Use GENERAL project management heuristics.

TASK DETAILS:
Title: ${title}
Description: ${description}
Priority: ${priority}
Number of subtasks: ${checklistCount}
Number of assignees: ${assignedTo.length}

RULES:
- First estimate effort (in hours)
- Then convert effort into calendar days FROM TODAY
- Be conservative
- Use ranges
- Express uncertainty honestly
- Do NOT mention AI or models

Return ONLY valid JSON.

JSON FORMAT:
{
  "estimatedHours": "min–max hours",
  "suggestedDueDate": "YYYY-MM-DD",
  "confidence": number between 0 and 1,
  "reasoning": "Short explanation of assumptions"
}
`;


        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        // 🔥 Clean Gemini formatting
        responseText = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(responseText);

        // 🛡️ Final safety normalization
        res.status(200).json({
            estimatedHours: parsed.estimatedHours,
            suggestedDueDate: parsed.suggestedDueDate,
            confidence: Math.min(Math.max(parsed.confidence, 0), 1),
            reasoning: parsed.reasoning,
            meta: {
                heuristicMode: !hasHistoricalData,
                generatedAt: new Date(),
            },
        });
    } catch (error) {
        console.error("Gemini AI Estimation Error:", error.message);

        res.status(500).json({
            message: "AI task estimation failed",
        });
    }
};

module.exports = { generateTaskUsingAI, estimateTaskUsingAI };


