import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CommodityImage from "../components/CommodityImage";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Register({ onDone }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "", phone: "", password: "", role: "farmer",
    state: "", district: "", language: "en",
    land_acres: "", commodities: [], organization: "",
  });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/states`).then(r => r.json()).then(d => setStates(d.states || []));
    fetch(`${API}/api/commodities`).then(r => r.json()).then(d => setCommodities(d.commodities || []));
  }, []);

  useEffect(() => {
    if (form.state) {
      fetch(`${API}/api/districts?state=${encodeURIComponent(form.state)}`)
        .then(r => r.json()).then(d => setDistricts(d.districts || []));
    }
  }, [form.state]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleCommodity = (c) => {
    setForm(f => ({
      ...f,
      commodities: f.commodities.includes(c)
        ? f.commodities.filter(x => x !== c)
        : [...f.commodities, c],
    }));
  };

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const body = { ...form, land_acres: form.land_acres ? parseFloat(form.land_acres) : null };
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      onDone();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 540, margin: "40px auto" }}>
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48 }}>🌱</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{t("register")}</h2>
        </div>

        {error && <div className="alert alert-red" style={{ marginBottom: 16 }}>{error}</div>}

        {/* Role toggle */}
        <div className="form-group">
          <label className="form-label">{t("role")}</label>
          <div style={{ display: "flex", gap: 12 }}>
            {["farmer", "buyer"].map(r => (
              <button key={r} onClick={() => set("role", r)}
                className="btn" style={{
                  flex: 1,
                  background: form.role === r ? "var(--green-mid)" : "white",
                  color: form.role === r ? "white" : "var(--text-secondary)",
                  border: `2px solid ${form.role === r ? "var(--green-mid)" : "var(--border)"}`,
                  fontSize: 15, fontWeight: 600,
                }}>
                {r === "farmer" ? "👨‍🌾 " : "🛒 "}{t(r)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("name")}</label>
            <input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("phone")}</label>
            <input className="form-input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">{t("password")}</label>
          <input className="form-input" type="password" value={form.password} onChange={e => set("password", e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("state")}</label>
            <select className="form-select" value={form.state} onChange={e => set("state", e.target.value)}>
              <option value="">— Select —</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("district")}</label>
            <select className="form-select" value={form.district} onChange={e => set("district", e.target.value)}>
              <option value="">— Select —</option>
              {districts.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">Preferred Language</label>
          <select className="form-select" value={form.language} onChange={e => set("language", e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>

        {form.role === "farmer" && (
          <>
            <div className="form-group">
              <label className="form-label">{t("land_acres")}</label>
              <input className="form-input" type="number" min="0" step="0.5"
                value={form.land_acres} onChange={e => set("land_acres", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t("your_commodities")}</label>
              <input
                className="form-input"
                placeholder="Search crops..."
                style={{ marginBottom: 8 }}
                id="reg-crop-search"
                onChange={e => {
                  const val = e.target.value.toLowerCase();
                  document.querySelectorAll(".reg-crop-btn").forEach(btn => {
                    btn.style.display = btn.dataset.name.toLowerCase().includes(val) ? "" : "none";
                  });
                }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 200, overflowY: "auto", padding: 10, border: "1.5px solid var(--border)", borderRadius: 10, background: "#fafafa" }}>
                {commodities.slice(0, 80).map(c => (
                  <button key={c} data-name={c} className="reg-crop-btn" onClick={() => toggleCommodity(c)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "6px 8px", borderRadius: 10, cursor: "pointer", border: "1.5px solid",
                      borderColor: form.commodities.includes(c) ? "var(--green-mid)" : "var(--border)",
                      background: form.commodities.includes(c) ? "var(--green-pale)" : "white",
                      minWidth: 64,
                    }}>
                    <CommodityImage commodity={c} size={36} showPopup={false} />
                    <span style={{ fontSize: 10, color: "var(--text-secondary)", textAlign: "center", maxWidth: 60 }}>
                      {c.length > 12 ? c.slice(0,11)+"…" : c}
                    </span>
                  </button>
                ))}
              </div>
              {form.commodities.length > 0 && (
                <p style={{ fontSize: 12, color: "var(--green-dark)", marginTop: 6, fontWeight: 600 }}>
                  ✅ Selected: {form.commodities.join(", ")}
                </p>
              )}
            </div>
          </>
        )}

        {form.role === "buyer" && (
          <div className="form-group">
            <label className="form-label">Organization (optional)</label>
            <input className="form-input" value={form.organization} onChange={e => set("organization", e.target.value)} />
          </div>
        )}

        <button className="btn btn-green btn-full" style={{ marginTop: 8 }} onClick={submit} disabled={loading}>
          {loading ? <span className="spinner" /> : t("register")}
        </button>
      </div>
    </div>
  );
}
