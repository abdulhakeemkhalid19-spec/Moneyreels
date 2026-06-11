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
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    const models = data.models?.map(m => m.name) || [];

    return res.status(200).json({
      status: "SUCCESS",
      available_models: models,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
}
