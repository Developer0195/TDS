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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateTaskUsingAI = async (req, res) => {
  try {
    const { title, fileText } = req.body;

    if (!title && !fileText) {
      return res.status(400).json({
        message: "Title or file content required",
      });
    }

    const prompt = `
You are a task management assistant.

Generate a task in STRICT JSON format.

Input:
${title ? `Title: ${title}` : ""}
${fileText ? `File Content: ${fileText}` : ""}

Rules:
- Output ONLY JSON
- No markdown
- No explanation
- No comments

Format:
{
  "title": "",
  "description": "",
  "priority": "Low | Medium | High",
  "todoCheckList": []
}
`;

    const model = genAI.getGenerativeModel({
    //   model: "gemini-1.5-pro",
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Gemini sometimes returns ```json ... ```
    const cleaned = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    res.status(200).json(parsed);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    res.status(500).json({
      message: "Gemini task generation failed",
    });
  }
};

module.exports = { generateTaskUsingAI };

