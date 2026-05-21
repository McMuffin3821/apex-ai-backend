import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Missing message"
      });
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      max_output_tokens: 120,     
      input: [
        {
          role: "system",
          content:
            "You are A.P.E.X, a calm futuristic tactical AI assistant inside a HUD interface. Speak clearly, naturally, intelligently, and helpfully. Keep responses concise but useful."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    return res.status(200).json({
      reply:
        response.output_text ||
        "A.P.E.X received the signal, but no response was generated."
    });
  } catch (err) {
    return res.status(500).json({
      error: "A.P.E.X backend error",
      details: err.message
    });
  }
}
