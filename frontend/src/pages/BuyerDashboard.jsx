import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function StarRating({ value, onChange }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={`star ${n <= value ? "active" : "inactive"}`} onClick={() => onChange(n)}>★</span>
      ))}
    </div>
  );
}

export default function BuyerDashboard({ lang }) {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [ratingForm, setRatingForm] = useState({ farmer_phone: "", stars: 5, comment: "" });
  const [ratingMsg, setRatingMsg] = useState("");
  const [states, setStates]     = useState([]);
  const [districts, setDistricts] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [reqForm, setReqForm]   = useState({ commodity: "", quantity_qtl: "", district: "", state: "", contact: user?.phone || "", note: "" });
  const [posting, setPosting]   = useState(false);
  const [postMsg, setPostMsg]   = useState("");

  useEffect(() => {
    if (!token) return;
    loadRequests();
    fetch(`${API}/api/states`).then(r => r.json()).then(d => setStates(d.states || []));
    fetch(`${API}/api/commodities`).then(r => r.json()).then(d => setCommodities(d.commodities || []));
  }, [token]);

  useEffect(() => {
    if (reqForm.state) {
      fetch(`${API}/api/districts?state=${encodeURIComponent(reqForm.state)}`).then(r => r.json()).then(d => setDistricts(d.districts || []));
    }
  }, [reqForm.state]);

  const loadRequests = () => {
    fetch(`${API}/api/my-requests?token=${token}`).then(r => r.json()).then(d => setRequests(d.requests || []));
  };

  const setR = (k, v) => setReqForm(f => ({ ...f, [k]: v }));

  const postRequest = async () => {
    setPosting(true); setPostMsg("");
    try {
      const res = await fetch(`${API}/api/buy-request`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reqForm, token, quantity_qtl: parseFloat(reqForm.quantity_qtl) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setPostMsg("✅ Request posted! Farmers in your area will see it.");
      loadRequests();
      setReqForm({ commodity: "", quantity_qtl: "", district: "", state: "", contact: user?.phone || "", note: "" });
    } catch (e) { setPostMsg("❌ " + e.message); }
    setPosting(false);
  };

  const submitRating = async () => {
    try {
      await fetch(`${API}/api/rate-farmer`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ratingForm, token }),
      });
      setRatingMsg("✅ Rating submitted!");
      setRatingForm({ farmer_phone: "", stars: 5, comment: "" });
    } catch { setRatingMsg("❌ Failed"); }
  };

  if (!user) return <div className="alert alert-amber">Please login to view your dashboard.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)", borderRadius: 16, padding: 24, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>🛒 {user.name}</h2>
            <p style={{ opacity: 0.85, fontSize: 14 }}>{user.district}, {user.state} {user.organization ? `· ${user.organization}` : ""}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-val">{requests.length}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{requests.filter(r => r.status === "accepted").length}</div>
          <div className="stat-label">Fulfilled</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{requests.filter(r => r.status === "open").length}</div>
          <div className="stat-label">Open</div>
        </div>
      </div>

      {/* Post buy request */}
      <div className="card">
        <div className="card-title">📦 {t("post_request")}</div>
        {postMsg && <div className={`alert ${postMsg.startsWith("✅") ? "alert-green" : "alert-red"}`} style={{ marginBottom: 12 }}>{postMsg}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("commodity")}</label>
            <select className="form-select" value={reqForm.commodity} onChange={e => setR("commodity", e.target.value)}>
              <option value="">— Select —</option>
              {commodities.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("quantity")} (qtl)</label>
            <input className="form-input" type="number" min="0" step="0.5" value={reqForm.quantity_qtl} onChange={e => setR("quantity_qtl", e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("state")}</label>
            <select className="form-select" value={reqForm.state} onChange={e => setR("state", e.target.value)}>
              <option value="">— Select —</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("district")}</label>
            <select className="form-select" value={reqForm.district} onChange={e => setR("district", e.target.value)}>
              <option value="">— Select —</option>
              {districts.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("contact")}</label>
            <input className="form-input" type="tel" value={reqForm.contact} onChange={e => setR("contact", e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t("note")}</label>
            <input className="form-input" placeholder="e.g. Grade A only" value={reqForm.note} onChange={e => setR("note", e.target.value)} />
          </div>
        </div>
        <button className="btn btn-amber" style={{ marginTop: 16 }} onClick={postRequest} disabled={posting}>
          {posting ? <span className="spinner" /> : t("post")}
        </button>
      </div>

      {/* My requests */}
      {requests.length > 0 && (
        <div className="card">
          <div className="card-title">📋 {t("your_requests")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {requests.map(r => (
              <div key={r.id} className="req-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="req-commodity">{r.commodity}</div>
                    <div className="req-meta">{r.quantity_qtl} qtl · {r.district}, {r.state}</div>
                    {r.note && <div className="req-meta" style={{ marginTop: 4 }}>{r.note}</div>}
                  </div>
                  <span className={`status-badge ${r.status === "open" ? "status-open" : "status-accepted"}`}>
                    {r.status === "open" ? t("open") : t("accepted")}
                  </span>
                </div>
                {r.status === "accepted" && (
                  <div className="alert alert-green" style={{ marginTop: 10, fontSize: 13 }}>
                    ✅ Accepted by <strong>{r.accepted_by_name}</strong> — {r.accepted_by_district}, {r.accepted_by_state}
                    <br />📞 Contact: {r.accepted_by}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rate a farmer */}
      <div className="card">
        <div className="card-title">⭐ {t("rate_farmer")}</div>
        {ratingMsg && <div className={`alert ${ratingMsg.startsWith("✅") ? "alert-green" : "alert-red"}`} style={{ marginBottom: 12 }}>{ratingMsg}</div>}
        <div className="form-group">
          <label className="form-label">Farmer Phone Number</label>
          <input className="form-input" type="tel" placeholder="e.g. 9876543210"
            value={ratingForm.farmer_phone} onChange={e => setRatingForm(f => ({ ...f, farmer_phone: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">{t("stars")}</label>
          <StarRating value={ratingForm.stars} onChange={v => setRatingForm(f => ({ ...f, stars: v }))} />
        </div>
        <div className="form-group">
          <label className="form-label">{t("comment")}</label>
          <input className="form-input" placeholder="Optional feedback..."
            value={ratingForm.comment} onChange={e => setRatingForm(f => ({ ...f, comment: e.target.value }))} />
        </div>
        <button className="btn btn-green" onClick={submitRating}>{t("submit")}</button>
      </div>
    </div>
  );
}
