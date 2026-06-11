import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [projectId, setProjectId] = useState("");
  const [checking, setChecking] = useState(false);

  const generateScript = async () => {
    if (!topic) return;
    setLoading(true);
    setScript("");
    setMessage("");
    setVideoUrl("");
    setProjectId("");
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setScript(data.script);
    } catch (error) {
      setMessage("❌ Failed to generate script. Try again!");
    }
    setLoading(false);
  };

  const createVideo = async () => {
    if (!script) return;
    setCreating(true);
    setMessage("");
    setVideoUrl("");
    try {
      const res = await fetch("/api/create-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, title: title || topic }),
      });
      const data = await res.json();
      if (data.projectId) {
        setProjectId(data.projectId);
        setMessage("⏳ Video is being created! Click 'Check Video Status' in 1-2 minutes.");
      } else {
        setMessage("❌ Failed to create video. Try again!");
      }
    } catch (error) {
      setMessage("❌ Video creation failed!");
    }
    setCreating(false);
  };

  const checkVideo = async () => {
    if (!projectId) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/check-video?projectId=${projectId}`);
      const data = await res.json();
      if (data.status === "done" && data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setMessage("✅ Video is ready! You can now post to YouTube.");
      } else {
        setMessage("⏳ Still processing... Try again in 30 seconds.");
      }
    } catch (error) {
      setMessage("❌ Failed to check video status!");
    }
    setChecking(false);
  };

  const postToYouTube = async () => {
    if (!videoUrl || !session) return;
    setPosting(true);
    setMessage("");
    try {
      const res = await fetch("/api/post-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || topic,
          description: script,
          script,
          videoUrl,
        }),
      });
      const data = await res.json();
      if (data.videoUrl) {
        setMessage("✅ Posted to YouTube successfully!");
      } else {
        setMessage("❌ Failed to post. Try again!");
      }
    } catch (error) {
      setMessage("❌ Failed to post to YouTube!");
    }
    setPosting(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f0f, #1a1a2e)",
      color: "white",
      fontFamily: "Arial, sans-serif",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "2.5rem", color: "#00d4ff" }}>💰 MoneyReels</h1>
          <p style={{ color: "#aaa" }}>AI Video Creator & YouTube Auto Poster</p>
        </div>

        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          {session ? (
            <div>
              <p style={{ color: "#00ff88" }}>✅ Connected as {session.user.email}</p>
              <button onClick={() => signOut()} style={{
                background: "#ff4444", color: "white",
                border: "none", padding: "10px 20px",
                borderRadius: "8px", cursor: "pointer"
              }}>Disconnect</button>
            </div>
          ) : (
            <button onClick={() => signIn("google")} style={{
              background: "linear-gradient(135deg, #00d4ff, #00ff88)",
              color: "black", border: "none",
              padding: "15px 30px", borderRadius: "10px",
              cursor: "pointer", fontWeight: "bold", fontSize: "1rem"
            }}>🔗 Connect YouTube Account</button>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Video title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%", padding: "15px",
              borderRadius: "10px", border: "1px solid #333",
              background: "#1e1e1e", color: "white",
              fontSize: "1rem", boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Enter money topic (e.g. 5 ways to save money in 2026)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{
              width: "100%", padding: "15px",
              borderRadius: "10px", border: "1px solid #333",
              background: "#1e1e1e", color: "white",
              fontSize: "1rem", boxSizing: "border-box"
            }}
          />
        </div>

        <button
          onClick={generateScript}
          disabled={loading || !topic}
          style={{
            width: "100%", padding: "15px",
            background: loading ? "#333" : "linear-gradient(135deg, #00d4ff, #00ff88)",
            color: loading ? "#aaa" : "black",
            border: "none", borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold", fontSize: "1rem",
            marginBottom: "15px"
          }}>
          {loading ? "⏳ Generating Script..." : "🤖 Generate Script"}
        </button>

        {script && (
          <div style={{
            background: "#1e1e1e", border: "1px solid #333",
            borderRadius: "10px", padding: "20px",
            marginBottom: "15px", whiteSpace: "pre-wrap",
            lineHeight: "1.8", color: "#eee"
          }}>
            <h3 style={{ color: "#00d4ff", marginTop: 0 }}>📝 Your Script:</h3>
            {script}
          </div>
        )}

        {script && (
          <button
            onClick={createVideo}
            disabled={creating}
            style={{
              width: "100%", padding: "15px",
              background: creating ? "#333" : "linear-gradient(135deg, #ff6600, #ff9900)",
              color: "white",
              border: "none", borderRadius: "10px",
              cursor: creating ? "not-allowed" : "pointer",
              fontWeight: "bold", fontSize: "1rem",
              marginBottom: "15px"
            }}>
            {creating ? "⏳ Creating Video..." : "🎬 Create Video"}
          </button>
        )}

        {projectId && !videoUrl && (
          <button
            onClick={checkVideo}
            disabled={checking}
            style={{
              width: "100%", padding: "15px",
              background: checking ? "#333" : "linear-gradient(135deg, #9900ff, #6600cc)",
              color: "white",
              border: "none", borderRadius: "10px",
              cursor: checking ? "not-allowed" : "pointer",
              fontWeight: "bold", fontSize: "1rem",
              marginBottom: "15px"
            }}>
            {checking ? "⏳ Checking..." : "🔍 Check Video Status"}
          </button>
        )}

        {videoUrl && (
          <div style={{ marginBottom: "15px" }}>
            <video
              src={videoUrl}
              controls
              style={{
                width: "100%", borderRadius: "10px",
                marginBottom: "15px"
              }}
            />
          </div>
        )}

        {videoUrl && session && (
          <button
            onClick={postToYouTube}
            disabled={posting}
            style={{
              width: "100%", padding: "15px",
              background: posting ? "#333" : "linear-gradient(135deg, #ff0000, #cc0000)",
              color: "white",
              border: "none", borderRadius: "10px",
              cursor: posting ? "not-allowed" : "pointer",
              fontWeight: "bold", fontSize: "1rem",
              marginBottom: "15px"
            }}>
          {posting ? "⏳ Posting to YouTube..." : "▶️ Post to YouTube"}
          </button>
        )}

        {message && (
          <p style={{
            textAlign: "center",
            color: message.includes("✅") ? "#00ff88" : message.includes("⏳") ? "#ffaa00" : "#ff4444",
            fontSize: "1.1rem"
          }}>{message}</p>
        )}

      </div>
    </div>
  );
            }
