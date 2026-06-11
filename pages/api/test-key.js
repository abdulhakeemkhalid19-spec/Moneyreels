export default async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY;
  
  if (!key) {
    return res.status(500).json({ 
      status: "ERROR",
      message: "API key is missing!" 
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{ role: "user", content: "Say hello" }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ 
        status: "ERROR", 
        message: data.error.message 
      });
    }

    return res.status(200).json({ 
      status: "SUCCESS", 
      message: "API key works!" 
    });
  } catch (error) {
    return res.status(500).json({ 
      status: "ERROR", 
      message: error.message 
    });
  }
}
