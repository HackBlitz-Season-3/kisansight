import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login({ onDone }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      login(data.token, data.user);
      onDone();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48 }}>🌾</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{t("login")}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>{t("tagline")}</p>
        </div>

        {error && <div className="alert alert-red" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">{t("phone")}</label>
          <input className="form-input" type="tel" placeholder="9876543210"
            value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{t("password")}</label>
          <input className="form-input" type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        <button className="btn btn-green btn-full" onClick={submit} disabled={loading}>
          {loading ? <span className="spinner" /> : t("login")}
        </button>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <button style={{ background: "none", border: "none", color: "var(--green-mid)", fontWeight: 600, cursor: "pointer" }}
            onClick={() => onDone("register")}>
            {t("register")}
          </button>
        </p>
      </div>
    </div>
  );
}
