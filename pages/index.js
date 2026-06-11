import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const generateScript = async () => {
    if (!topic) return;
    setLoading(true);
    setScript("");
    setMessage("");
    setVideoUrl("");
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setScript(data.script);
    } catch (error) {
      setMessage("Failed to generate script. Try again!");
    }
    setLoading(false);
  };

  const postToYouTube = async () => {
    if (!script || !session) return;
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
        }),
      });
      const data = await res.json();
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
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
          <p style={{ color: "#aaa" }}>AI Script Generator & YouTube Auto Poster</p>
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

        {script && session && (
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
            color: message.includes("✅") ? "#00ff88" : "#ff4444",
            fontSize: "1.1rem"
          }}>{message}</p>
        )}

        {videoUrl && (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{
            display: "block", textAlign: "center",
            color: "#00d4ff", marginTop: "10px"
          }}>
            🎬 View your video on YouTube
          </a>
        )}

      </div>
    </div>
  );
          }
