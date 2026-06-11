import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { title, description, script } = req.body;

  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const youtube = google.youtube({ version: "v3", auth });

    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title || "Money Tips 2026",
          description: description || script,
          tags: ["money", "finance", "savings", "investing"],
          categoryId: "22",
        },
        status: {
          privacyStatus: "public",
        },
      },
      media: {
        mimeType: "video/mp4",
      },
    });

    return res.status(200).json({
      success: true,
      videoId: response.data.id,
      videoUrl: `https://youtube.com/watch?v=${response.data.id}`,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to post to YouTube" });
  }
}
