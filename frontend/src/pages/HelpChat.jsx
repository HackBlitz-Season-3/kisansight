import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import MicButton from "../components/MicButton";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const QUICK = [
  "What is MSP?",
  "When to sell tomatoes?",
  "How to get PM-KISAN benefits?",
  "Best storage for onions?",
  "How does KisanSight forecast work?",
  "What is a Mandi?",
];

export default function HelpChat({ lang }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { role: "bot", text: "👋 Hello! I'm KisanSight Assistant. Ask me anything about crop prices, farming, government schemes, or how to use this app." }
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role === "user" ? "user" : "model", text: m.text }));
      const res = await fetch(`${API}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, lang, history }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't get a response.";
      setMessages(m => [...m, { role: "bot", text: reply }]);

      // Read aloud the response
      if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(reply);
        utter.lang = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
        window.speechSynthesis.speak(utter);
      }
    } catch {
      setMessages(m => [...m, { role: "bot", text: "Sorry, something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  const handleVoice = (text) => {
    setInput(text);
    setTimeout(() => send(text), 200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)", borderRadius: 16, padding: 24, color: "white" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🤖 {t("help")}</h2>
        <p style={{ opacity: 0.85, fontSize: 14 }}>AI-powered help in Hindi, Marathi, and English. Tap mic to speak.</p>
      </div>

      {/* Quick questions */}
      <div className="card">
        <div className="card-title">⚡ Quick Questions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)}
              style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", background: "var(--green-pale)", color: "var(--green-dark)", border: "1px solid #bbf7d0", fontWeight: 500 }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="chat-messages" style={{ borderRadius: "12px 12px 0 0", margin: 0 }}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.role === "bot" && <span style={{ fontSize: 16, marginRight: 6 }}>🤖</span>}
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="chat-msg bot">
              <span style={{ opacity: 0.6 }}>Thinking</span>
              <span style={{ animation: "pulse 1s infinite" }}> ●●●</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "white" }}>
          <div className="chat-input-row">
            <input
              className="form-input"
              placeholder={t("ask_anything")}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
            />
            <MicButton onResult={handleVoice} lang={lang} />
            <button className="btn btn-green" onClick={() => send()} disabled={loading || !input.trim()}>
              {t("send")}
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 6 }}>
            🔊 Responses are read aloud automatically. Powered by Gemini AI (free tier).
          </p>
        </div>
      </div>
    </div>
  );
}
