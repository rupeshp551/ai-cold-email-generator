import axios from "axios";
import "dotenv/config";
import EmailHistory from "../models/EmailHistory.js";

export const generateEmail = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    if (typeof prompt !== "string") {
      return res.status(400).json({ message: "Prompt must be a string" });
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({ message: "Prompt cannot be empty" });
    }

    if (prompt.length > 2000) {
      return res
        .status(400)
        .json({ message: "Prompt cannot exceed 2000 characters" });
    }

    // Call Groq API 
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ message: "AI service is not configured" });
    }

    const systemPrompt = `You are an expert tech career outreach strategist.

Your task is to generate HIGH-CONVERTING outreach content for:
- Final year students
- Fresh graduates
- Internship seekers
- Entry-level engineers and developers
- Junior devs

The candidate may belong to:
- Software Engineering
- Full Stack Development
- Frontend or Backend Development
- AI/ML Engineering
- Data Science
- Data Analytics
- Cloud/DevOps
- Cybersecurity
- Mobile App Development
- General Computer Science roles

====================================================
IMPORTANT
====================================================

- Even if the user gives only 2–4 words, intelligently assume realistic context.
- Do NOT ask for clarification.
- Make professional assumptions automatically.
- Keep responses realistic and modern.
- Avoid generic or desperate phrasing.
- Keep content concise and recruiter-friendly.

====================================================
OUTPUT FORMAT (STRICT)
====================================================

Return ONLY valid JSON:

{
  "subject": "",
  "emailBody": "",
  "linkedInDM": "",
  "followUpEmail": ""
}

No markdown.
No explanations.
Only JSON.

====================================================
DEFAULT CANDIDATE PROFILE
====================================================

Assume the candidate:
- Is in final year OR recently graduated
- Has strong technical fundamentals
- Has built academic, freelance, internship, or personal projects
- Has practical exposure to modern technologies
- Is actively looking for internships or full-time opportunities
- Learns quickly and adapts fast

Depending on the prompt, intelligently infer relevant skills:

For Software / Full Stack:
- React, Node.js, APIs, databases, scalable systems

For AI/ML:
- Python, TensorFlow, PyTorch, model training, NLP, computer vision

For Data Science:
- Python, SQL, data analysis, visualization, statistics

For Cloud/DevOps:
- AWS, Docker, CI/CD, deployment pipelines

For Cybersecurity:
- Security concepts, networking, vulnerability assessment

For Mobile:
- Android, Flutter, React Native, app architecture

====================================================
SUBJECT LINE RULES
====================================================

• 6–10 words
• Must sound confident and professional
• Highlight skills, projects, or technical strengths
• Avoid phrases like:
  - "Looking for internship"
  - "Need a job"
  - "Please hire me"
  - "Quick question"

Examples:
"Final year engineer building scalable AI solutions"
"Data science student focused on real-world analytics"
"Frontend developer with strong React project experience"
"ML enthusiast experienced in NLP-based applications"

====================================================
EMAIL BODY STRUCTURE
====================================================

Keep 70–110 words.

Structure:
1. Personalized observation about company/team/product
2. Mention engineering/product challenge or opportunity
3. Candidate background and technical strengths
4. Mention projects, internships, or practical work
5. Explain potential contribution/value
6. Clear CTA
7. Professional sign-off

Tone:
• Professional
• Confident
• Curious
• Motivated
• NOT desperate
• NOT overly corporate
• No emojis
• No exaggerated hype

====================================================
LINKEDIN DM STRUCTURE
====================================================

35–55 words.

Structure:
- Observation
- Technical interest/value
- Soft CTA

Should feel natural and recruiter-friendly.

====================================================
FOLLOW-UP EMAIL STRUCTURE
====================================================

50–90 words.

Requirements:
- Introduce a new angle or added value
- Reinforce enthusiasm and adaptability
- Mention willingness to contribute and learn
- Professional urgency
- Clear CTA

====================================================

Return ONLY valid JSON.`;

    const fullPrompt = `${systemPrompt}\n\nUser REQUEST: "${prompt.trim()}"\n\nGenerate STRONG cold email even if prompt is short. Make smart assumptions. Return ONLY valid JSON:\n{"subject": "...", "emailBody": "...", "linkedInDM": "...", "followUpEmail": "..."}`;
    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    // Parse the Groq response
    if (
      !aiResponse.data.choices ||
      !aiResponse.data.choices[0] ||
      !aiResponse.data.choices[0].message
    ) {
      throw new Error("Invalid response from Groq API");
    }

    const generatedText = aiResponse.data.choices[0].message.content;

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    let parsedResponse;

    try {
      parsedResponse = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : JSON.parse(generatedText);
    } catch (parseError) {
      console.error(
        "JSON parse error:",
        parseError,
        "Generated text:",
        generatedText,
      );
      return res.status(500).json({
        message: "Failed to parse AI response",
        error: "The AI generated invalid JSON. Please try again.",
      });
    }

    const emailData = {
      subject: parsedResponse.subject || "New Opportunity",
      emailBody: parsedResponse.emailBody || "",
      linkedInDM: parsedResponse.linkedInDM || "",
      followUpEmail: parsedResponse.followUpEmail || "",
    };

    // Validate response data
    if (!emailData.subject || !emailData.emailBody) {
      return res.status(500).json({
        message: "AI generated incomplete email data. Please try again.",
      });
    }

    // Save to history
    const historyEntry = await EmailHistory.create({
      user: req.user._id,
      prompt: prompt.trim(),
      subject: emailData.subject,
      emailBody: emailData.emailBody,
      linkedInDM: emailData.linkedInDM,
      followUpEmail: emailData.followUpEmail,
    });

    res.status(200).json(historyEntry);
  } catch (error) {
    console.error(
      "AI Generation Error:",
      error.response?.data || error.message,
    );

    if (error.response?.status === 429) {
      return res.status(429).json({
        message: "Too many requests. Please wait a moment before trying again.",
        error: "Rate limit exceeded",
      });
    }

    res.status(500).json({
      message: "Failed to generate email",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await EmailHistory.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

export const deleteHistoryItem = async (req, res) => {
  try {
    const item = await EmailHistory.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        message: "History item not found",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      message: "History item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete history item",
    });
  }
};
