export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: "Project ID required" });
  }

  try {
    const response = await fetch(
      `https://api.json2video.com/v2/movies?project=${projectId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.JSON2VIDEO_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (data.movie) {
      const status = data.movie.status;
      const videoUrl = data.movie.url;

      return res.status(200).json({
        status,
        videoUrl: status === "done" ? videoUrl : null,
        message:
          status === "done"
            ? "Video is ready!"
            : "Video is still being processed...",
      });
    } else {
      return res.status(500).json({ error: "Could not check video status" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to check video status" });
  }
}
