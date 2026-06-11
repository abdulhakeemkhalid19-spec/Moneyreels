export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { script, title } = req.body;

  const lines = script.split("\n").filter((line) => line.trim() !== "");

  const scenes = lines.map((line) => ({
    comment: line,
    elements: [
      {
        type: "video",
        src: "https://assets.json2video.com/assets/videos/backgrounds/finance-01.mp4",
        volume: 0.3,
      },
      {
        type: "text",
        style: "007",
        text: line.replace(/^(HOOK:|POINT \d:|CTA:)\s*/i, ""),
        duration: 4,
        settings: {
          color: "#FFFFFF",
          "font-size": 60,
          "font-family": "Montserrat",
          "font-weight": "bold",
          "text-align": "center",
          "vertical-align": "middle",
          "background-color": "rgba(0,0,0,0.5)",
          padding: 30,
        },
      },
      {
        type: "voice",
        text: line.replace(/^(HOOK:|POINT \d:|CTA:)\s*/i, ""),
        voice: "en-US-Neural2-D",
        settings: {
          speed: 1.0,
          pitch: 0,
        },
      },
    ],
  }));

  const movieData = {
    comment: title || "MoneyReels Video",
    resolution: "instagram-story",
    quality: "high",
    scenes,
  };

  try {
    const response = await fetch("https://api.json2video.com/v2/movies", {
      method: "POST",
      headers: {
        "x-api-key": process.env.JSON2VIDEO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movieData),
    });

    const data = await response.json();

    if (data.project) {
      return res.status(200).json({
        success: true,
        projectId: data.project,
        message: "Video is being created! Check back in 1-2 minutes.",
      });
    } else {
      return res.status(500).json({ error: "Failed to create video", details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: "Video creation failed" });
  }
}
