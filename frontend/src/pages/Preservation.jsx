import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CommodityImage from "../components/CommodityImage";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TIPS = {
  "Tomato":   ["Store in cool dry place", "Do not refrigerate unripe tomatoes", "Use within 5–7 days of ripening"],
  "Onion":    ["Store in mesh bags for air circulation", "Keep away from direct sunlight", "Never store near potatoes"],
  "Potato":   ["Store in dark cool place", "Remove from plastic bags", "Sprouts? Cut before cooking"],
  "Mango":    ["Ripen at room temp, then refrigerate", "Wrap in newspaper to slow ripening", "Avoid stacking"],
  "Banana":   ["Hang bananas to prevent bruising", "Refrigerate when ripe (skin turns dark but fruit stays good)", "Wrap crown in plastic"],
  "Grapes":   ["Refrigerate unwashed", "Keep in ventilated container", "Use within 1–2 weeks"],
  "Cauliflower": ["Wrap in damp cloth", "Refrigerate stem-side up", "Use within 5 days"],
  "Cabbage":  ["Wrap tightly in plastic", "Refrigerate", "Keeps for 2–3 weeks"],
};

const DEFAULT_TIPS = ["Store in cool, dry, well-ventilated place", "Avoid moisture and direct sunlight", "Check regularly and remove damaged produce"];

export default function Preservation({ lang }) {
  const { t } = useTranslation();
  const [commodities, setCommodities] = useState([]);
  const [selected, setSelected]       = useState("");
  const [videoUrl, setVideoUrl]       = useState("");

  useEffect(() => {
    fetch(`${API}/api/commodities`).then(r => r.json()).then(d => {
      setCommodities(d.commodities || []);
      setSelected(d.commodities?.[0] || "");
    });
  }, []);

  useEffect(() => {
    if (selected) {
      fetch(`${API}/api/preservation?commodity=${encodeURIComponent(selected)}&lang=${lang}`)
        .then(r => r.json()).then(d => setVideoUrl(d.youtube_url || ""));
    }
  }, [selected, lang]);

  const tips = TIPS[selected] || DEFAULT_TIPS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #164e63, #0891b2)", borderRadius: 16, padding: 24, color: "white" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🥦 {t("preservation")}</h2>
        <p style={{ opacity: 0.85, fontSize: 14 }}>Learn how to store your produce to reduce spoilage and maximise value.</p>
      </div>

      {/* Commodity selector */}
      <div className="card">
        <div className="card-title">Select Commodity</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 10, maxHeight: 280, overflowY: "auto" }}>
          {commodities.slice(0, 60).map(c => (
            <button key={c} onClick={() => setSelected(c)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                padding: "8px 4px", borderRadius: 12, cursor: "pointer",
                border: `2px solid ${selected === c ? "var(--green-mid)" : "var(--border)"}`,
                background: selected === c ? "var(--green-pale)" : "white",
                transition: "all 0.15s", outline: "none",
              }}>
              <CommodityImage commodity={c} size={48} showPopup={false} />
              <span style={{ fontSize: 10, color: selected === c ? "var(--green-dark)" : "var(--text-secondary)", fontWeight: selected === c ? 700 : 400, textAlign: "center", lineHeight: 1.2 }}>
                {c.length > 14 ? c.slice(0,13)+"…" : c}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <>
          {/* Selected commodity display */}
          <div className="card">
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <CommodityImage commodity={selected} size={96} showPopup={true} />
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--green-dark)" }}>{selected}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Storage & preservation guide</p>
              </div>
            </div>

            {/* Tips */}
            <div style={{ marginTop: 20 }}>
              <div className="card-title" style={{ marginBottom: 10 }}>💡 Quick Tips</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {tips.map((tip, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, padding: "8px 12px", background: "var(--green-pale)", borderRadius: 8 }}>
                    <span style={{ color: "var(--green-mid)", fontWeight: 700 }}>✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* YouTube link */}
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>▶️</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{t("watch_videos")} — {selected}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
              Find step-by-step YouTube tutorials in your language (Hindi / Marathi / English)
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {[["en", "English"], ["hi", "हिंदी"], ["mr", "मराठी"]].map(([code, label]) => (
                <a key={code}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selected)}+preservation+storage+method+${code === "en" ? "english" : code === "hi" ? "hindi" : "marathi"}`}
                  target="_blank" rel="noreferrer"
                  className="btn btn-red"
                  style={{ textDecoration: "none", fontSize: 14 }}>
                  🎬 {label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
