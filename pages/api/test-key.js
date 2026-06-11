export default async function handler(req, res) {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return res.status(500).json({
      status: "ERROR",
      message: "GEMINI_API_KEY is missing!",
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say hello" }] }],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({
        status: "ERROR",
        message: data.error.message,
      });
    }

    return res.status(200).json({
      status: "SUCCESS",
      message: "Gemini works! 🎉",
      reply: data.candidates[0].content.parts[0].text,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
}
