export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { script, title } = req.body;

  if (!process.env.JSON2VIDEO_API_KEY) {
    return res.status(500).json({ error: "Missing JSON2VIDEO_API_KEY" });
  }

  try {
    const lines = script
      .split("\n")
      .filter((line) => line.trim() !== "")
      .slice(0, 5);

    const scenes = lines.map((line) => ({
      comment: line.substring(0, 50),
      elements: [
        {
          type: "text",
          style: "007",
          text: line.replace(/\*\*/g, "").substring(0, 100),
          duration: 5,
          settings: {
            "font-size": 40,
            "font-family": "Montserrat",
            "font-weight": "bold",
            color: "#FFFFFF",
            "text-align": "center",
            "vertical-align": "middle",
            "background-color": "#000000",
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

    const response = await fetch("https://api.json2video.com/v2/movies", {
      method: "POST",
      headers: {
        "x-api-key": process.env.JSON2VIDEO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movieData),
    });

    const text = await response.text();
    const data = JSON.parse(text);

    if (data.project) {
      return res.status(200).json({
        success: true,
        projectId: data.project,
        message: "Video is being created!",
      });
    } else {
      return res.status(500).json({
        error: "Failed to create video",
        details: JSON.stringify(data),
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
