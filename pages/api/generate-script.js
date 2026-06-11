export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a viral personal finance content creator. 
                  Create a short engaging video script about: "${topic}"
                  
                  Format it as:
                  HOOK: (attention grabbing opening)
                  POINT 1: (key insight)
                  POINT 2: (key insight)
                  POINT 3: (key insight)
                  CTA: (call to action)
                  
                  Keep it under 60 seconds. Make it punchy and valuable.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const script = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ script });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
