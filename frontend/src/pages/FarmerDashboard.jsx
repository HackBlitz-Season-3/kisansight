import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import CommodityImage from "../components/CommodityImage";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function FarmerDashboard({ lang }) {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [profile, setProfile]     = useState(null);
  const [sells, setSells]         = useState([]);
  const [totalRev, setTotalRev]   = useState(0);
  const [logForm, setLogForm]     = useState({ commodity: "", quantity_qtl: "", price_per_qtl: "", sold_on: "today", forecast_at_time: "" });
  const [commodities, setCommodities] = useState([]);
  const [submitting, setSubmitting]   = useState(false);
  const [msg, setMsg]             = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/profile?token=${token}`).then(r => r.json()).then(d => setProfile(d));
    fetch(`${API}/api/sell-log?token=${token}`).then(r => r.json()).then(d => { setSells(d.sells || []); setTotalRev(d.total_revenue || 0); });
    fetch(`${API}/api/commodities`).then(r => r.json()).then(d => setCommodities(d.commodities || []));
  }, [token]);

  const set = (k, v) => setLogForm(f => ({ ...f, [k]: v }));

  const submitLog = async () => {
    setSubmitting(true); setMsg("");
    try {
      const res = await fetch(`${API}/api/sell-log`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...logForm, token, quantity_qtl: parseFloat(logForm.quantity_qtl), price_per_qtl: parseFloat(logForm.price_per_qtl), forecast_at_time: logForm.forecast_at_time ? parseFloat(logForm.forecast_at_time) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setMsg("✅ Sale logged successfully!");
      fetch(`${API}/api/sell-log?token=${token}`).then(r => r.json()).then(d => { setSells(d.sells || []); setTotalRev(d.total_revenue || 0); });
      setLogForm({ commodity: "", quantity_qtl: "", price_per_qtl: "", sold_on: "today", forecast_at_time: "" });
    } catch (e) { setMsg("❌ " + e.message); }
    setSubmitting(false);
  };

  if (!user) return <div className="alert alert-amber">Please login to view your dashboard.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a5c2a, #2d8a47)", borderRadius: 16, padding: "24px", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>👨‍🌾 {user.name}</h2>
            <p style={{ opacity: 0.85, fontSize: 14 }}>{user.district}, {user.state} · {user.land_acres ? `${user.land_acres} acres` : "Farmer"}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-val">₹{totalRev.toLocaleString("en-IN")}</div>
          <div className="stat-label">{t("total_revenue")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{sells.length}</div>
          <div className="stat-label">{t("sold_count")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{profile?.avg_rating ?? "—"} ⭐</div>
          <div className="stat-label">{t("avg_rating")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{user.commodities?.length ?? 0}</div>
          <div className="stat-label">Commodities</div>
        </div>
      </div>

      {/* My commodities */}
      {user.commodities?.length > 0 && (
        <div className="card">
          <div className="card-title">🌿 {t("your_commodities")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {user.commodities.map(c => (
              <div key={c} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <CommodityImage commodity={c} size={56} showPopup={true} />
                <span style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", maxWidth: 64 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log a sale */}
      <div className="card">
        <div className="card-title">📝 {t("sell_log")}</div>
        {msg && <div className={`alert ${msg.startsWith("✅") ? "alert-green" : "alert-red"}`} style={{ marginBottom: 12 }}>{msg}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("commodity")}</label>
            <select className="form-select" value={logForm.commodity} onChange={e => set("commodity", e.target.value)}>
              <option value="">— Select —</option>
              {commodities.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("quantity")} (qtl)</label>
            <input className="form-input" type="number" min="0" step="0.5" value={logForm.quantity_qtl} onChange={e => set("quantity_qtl", e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("price")} (₹)</label>
            <input className="form-input" type="number" min="0" value={logForm.price_per_qtl} onChange={e => set("price_per_qtl", e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Forecast price at time (₹)</label>
            <input className="form-input" type="number" min="0" placeholder="Optional" value={logForm.forecast_at_time} onChange={e => set("forecast_at_time", e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sold</label>
            <select className="form-select" value={logForm.sold_on} onChange={e => set("sold_on", e.target.value)}>
              <option value="today">Same day</option>
              <option value="held_3d">Held 3 days</option>
              <option value="held_1w">Held 1 week</option>
              <option value="held_1m">Held 1 month</option>
            </select>
          </div>
        </div>
        <button className="btn btn-green" style={{ marginTop: 16 }} onClick={submitLog} disabled={submitting}>
          {submitting ? <span className="spinner" /> : t("sell_log")}
        </button>
      </div>

      {/* Sell history table */}
      {sells.length > 0 && (
        <div className="card">
          <div className="card-title">📋 {t("my_sales")}</div>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Date</th><th>Commodity</th><th>Qty (qtl)</th>
                <th>Price (₹/qtl)</th><th>Revenue</th><th>vs Forecast</th>
              </tr></thead>
              <tbody>
                {sells.map(s => (
                  <tr key={s.id}>
                    <td>{s.date}</td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><CommodityImage commodity={s.commodity} size={28} showPopup={false} />{s.commodity}</div></td>
                    <td>{s.quantity_qtl}</td>
                    <td>₹{s.price_per_qtl}</td>
                    <td style={{ fontWeight: 600, color: "var(--green-dark)" }}>₹{s.revenue?.toLocaleString("en-IN")}</td>
                    <td style={{ color: s.profit_vs_forecast > 0 ? "green" : s.profit_vs_forecast < 0 ? "red" : "gray" }}>
                      {s.profit_vs_forecast != null ? (s.profit_vs_forecast > 0 ? "+" : "") + "₹" + s.profit_vs_forecast : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
