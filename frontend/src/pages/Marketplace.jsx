import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import CommodityImage from "../components/CommodityImage";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Marketplace({ lang }) {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter]     = useState({ state: "", district: "", commodity: "" });
  const [states, setStates]     = useState([]);
  const [accepting, setAccepting] = useState("");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    fetch(`${API}/api/states`).then(r => r.json()).then(d => setStates(d.states || []));
    loadRequests();
  }, []);

  const loadRequests = (f = filter) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.state)     params.set("state", f.state);
    if (f.district)  params.set("district", f.district);
    if (f.commodity) params.set("commodity", f.commodity);
    fetch(`${API}/api/buy-requests?${params}`).then(r => r.json()).then(d => {
      setRequests(d.requests || []);
      setLoading(false);
    });
  };

  const setF = (k, v) => {
    const nf = { ...filter, [k]: v };
    setFilter(nf);
    loadRequests(nf);
  };

  const accept = async (id) => {
    if (!token || user?.role !== "farmer") {
      alert("You need to be logged in as a farmer to accept requests.");
      return;
    }
    setAccepting(id);
    try {
      const res = await fetch(`${API}/api/accept-request`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, request_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setNotification({ type: "success", msg: data.message, farmer: data.farmer });
      loadRequests();
    } catch (e) {
      setNotification({ type: "error", msg: e.message });
    }
    setAccepting("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #78350f, #d97706)", borderRadius: 16, padding: 24, color: "white" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🏪 {t("marketplace")}</h2>
        <p style={{ opacity: 0.85, fontSize: 14 }}>Buyers post what they need. Farmers fulfil orders directly.</p>
      </div>

      {/* Notification popup */}
      {notification && (
        <div className={`alert ${notification.type === "success" ? "alert-green" : "alert-red"}`}>
          {notification.msg}
          <button style={{ float: "right", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }} onClick={() => setNotification(null)}>×</button>
          {notification.type === "success" && (
            <div style={{ marginTop: 10, padding: 10, background: "rgba(255,255,255,0.5)", borderRadius: 8, fontSize: 13 }}>
              📲 The buyer will receive an SMS + WhatsApp message with your contact: <strong>{notification.farmer?.phone}</strong>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: "1 1 160px", marginBottom: 0 }}>
            <label className="form-label">{t("state")}</label>
            <select className="form-select" value={filter.state} onChange={e => setF("state", e.target.value)}>
              <option value="">All States</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: "1 1 200px", marginBottom: 0 }}>
            <label className="form-label">{t("commodity")}</label>
            <input className="form-input" placeholder="e.g. Tomato" value={filter.commodity} onChange={e => setF("commodity", e.target.value)} />
          </div>
          <button className="btn btn-outline" onClick={() => { setFilter({ state: "", district: "", commodity: "" }); loadRequests({ state: "", district: "", commodity: "" }); }}>
            Clear
          </button>
        </div>
      </div>

      {/* Requests grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>Loading requests...</div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)", fontSize: 16 }}>
          📭 No open requests found. Try changing the filters.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {requests.map(r => (
            <div key={r.id} className="req-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <CommodityImage commodity={r.commodity} size={48} />
                  <div>
                    <div className="req-commodity">{r.commodity}</div>
                    <div className="req-meta">{r.quantity_qtl} quintal required</div>
                  </div>
                </div>
                <span className="status-badge status-open">{t("open")}</span>
              </div>

              <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                <span>📍 {r.district}, {r.state}</span>
                <span>👤 {r.buyer_name}</span>
                <span>📞 {r.contact}</span>
                {r.note && <span>📝 {r.note}</span>}
                <span style={{ color: "#9ca3af" }}>🗓 {r.date}</span>
              </div>

              {user?.role === "farmer" && (
                <button className="btn btn-green btn-full btn-sm" onClick={() => accept(r.id)} disabled={accepting === r.id}>
                  {accepting === r.id ? <span className="spinner" /> : `✅ ${t("accept")}`}
                </button>
              )}
              {!user && (
                <p style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center" }}>Login as a farmer to accept this order</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
