import { useState, useRef } from "react";

export default function MicButton({ onResult, lang = "en" }) {
  const [recording, setRecording] = useState(false);
  const recogRef = useRef(null);

  const langMap = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };

  const toggle = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser. Use Chrome.");
      return;
    }
    if (recording) {
      recogRef.current?.stop();
      setRecording(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SR();
    recog.lang = langMap[lang] || "en-IN";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(text);
      setRecording(false);
    };
    recog.onerror = () => setRecording(false);
    recog.onend = () => setRecording(false);
    recog.start();
    recogRef.current = recog;
    setRecording(true);
  };

  return (
    <button
      className={`mic-btn ${recording ? "recording" : ""}`}
      onClick={toggle}
      title={recording ? "Tap to stop" : "Tap to speak"}
      type="button"
    >
      {recording ? "⏹" : "🎤"}
    </button>
  );
}
