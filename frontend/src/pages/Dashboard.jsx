import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import SignalBadge from "../components/SignalBadge";
import ForecastChart from "../components/ForecastChart";
import WeatherCard from "../components/WeatherCard";
import NewsCard from "../components/NewsCard";
import CommodityImage from "../components/CommodityImage";
import MicButton from "../components/MicButton";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// All 28 states from the dataset — hardcoded so they appear instantly
const ALL_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
  "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Punjab",
  "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
];

// Category groupings for the visual grid
const CATEGORIES = {
  "🍅 Vegetables": [
    "Tomato","Onion","Potato","Cabbage","Cauliflower","Brinjal","Capsicum",
    "Bhindi(Ladies Finger)","Carrot","Raddish","Beetroot","Spinach","Methi(Leaves)",
    "Green Chilli","Chili Red","Bitter gourd","Bottle gourd","Ridge gourd(Tori)",
    "Snake gourd","Sponge gourd","Pumpkin","White Pumpkin","Sweet Pumpkin",
    "Ashgourd","Round gourd","Tinda","Chow Chow","Little gourd (Kundru)",
    "Pointed gourd (Parval)","Cucumbar(Kheera)","Drumstick","Colacasia",
    "Elephant Yam (Suran)","Sweet Potato","Yam","Yam (Ratalu)","Tapioca",
    "Cluster beans","Cowpea(Veg)","French Beans (Frasbean)","Beans","Bunch Beans",
    "Green Peas","Peas Wet","Field Pea","Onion Green","Coriander(Leaves)",
    "Mint(Pudina)","Leafy Vegetable","Amaranthus",
  ],
  "🍎 Fruits": [
    "Tomato","Mango","Banana","Apple","Grapes","Papaya","Pineapple","Pomegranate",
    "Watermelon","Water Melon","Guava","Lemon","Lime","Orange","Mousambi(Sweet Lime)",
    "Kinnow","Litchi","Coconut","Tender Coconut","Custard Apple (Sharifa)",
    "Chikoos(Sapota)","Jack Fruit","Peach","Pear(Marasebu)","Cherry","Plum",
    "Apricot(Jardalu/Khumani)","Karbuja(Musk Melon)","Amla(Nelli Kai)",
    "Ber(Zizyphus/Borehannu)","Jamun(Narale Hannu)","Persimon(Japani Fal)",
    "Dry Grapes","Papaya (Raw)","Mango (Raw-Ripe)","Banana - Green",
  ],
  "🌾 Grains & Cereals": [
    "Wheat","Rice","Maize","Jowar(Sorghum)","Bajra(Pearl Millet/Cumbu)",
    "Ragi (Finger Millet)","Barley (Jau)","Millets","Foxtail Millet(Navane)",
    "Paddy(Dhan)(Basmati)","Paddy(Dhan)(Common)","Broken Rice","Beaten Rice",
    "Wheat Atta","Maida Atta","Bran",
  ],
  "🫘 Pulses & Legumes": [
    "Arhar (Tur/Red Gram)(Whole)","Arhar Dal(Tur Dal)","Bengal Gram(Gram)(Whole)",
    "Bengal Gram Dal (Chana Dal)","Black Gram (Urd Beans)(Whole)","Black Gram Dal (Urd Dal)",
    "Green Gram (Moong)(Whole)","Green Gram Dal (Moong Dal)","Lentil (Masur)(Whole)",
    "Masur Dal","Red Gram","Cowpea (Lobia/Karamani)","Kabuli Chana(Chickpeas-White)",
    "Soyabean","Green Avare (W)","Field Pea","Peas(Dry)","Other Pulses",
  ],
  "🌶️ Spices": [
    "Dry Chillies","Turmeric","Turmeric (raw)","Ginger(Green)","Ginger(Dry)",
    "Garlic","Coriander(Leaves)","Corriander seed","Cummin Seed(Jeera)","Methi Seeds",
    "Black pepper","Cardamoms","Cloves","Nutmeg","Mace","Ajwan","Soanf","Bay leaf (Tejpatta)",
  ],
  "🥜 Oilseeds": [
    "Groundnut","Groundnut pods (raw)","Groundnut (Split)","Mustard","Safflower",
    "Sunflower","Sunflower Seed","Sesamum(Sesame,Gingelly,Til)","Castor Seed",
    "Linseed","Niger Seed (Ramtil)","Cotton Seed","Soyabean","Coconut Seed","Copra",
  ],
  "💐 Flowers": [
    "Rose(Local)","Rose(Loose)","Jasmine","Marigold(Calcutta)","Marigold(loose)",
    "Chrysanthemum","Chrysanthemum(Loose)","Carnation","Gladiolus Cut Flower",
    "Tube Rose(Double)","Tube Rose(Loose)","Tube Rose(Single)","Lilly","Lotus",
    "Orchid","Anthorium",
  ],
  "🌿 Others": [
    "Sugarcane","Cotton","Rubber","Tea","Coffee","Cocoa","Tobacco","Jute",
    "Arecanut(Betelnut/Supari)","Betal Leaves","Tamarind Fruit","Tamarind Seed",
    "Coconut Oil","Gur(Jaggery)","Sugar","Walnut","Almond(Badam)","Cashewnuts",
    "Cashew Kernnel",
  ],
};

export default function Dashboard({ lang }) {
  const { t } = useTranslation();
  const [allCommodities, setAllCommodities] = useState([]);
  const [commodity, setCommodity] = useState("");
  const [state, setState]         = useState("Maharashtra");
  const [search, setSearch]       = useState("");
  const [activeTab, setActiveTab] = useState("🍅 Vegetables");
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const resultsRef                = useRef(null);

  // Load full commodity list from backend (for search + any extras)
  useEffect(() => {
    fetch(`${API}/api/commodities`).then(r => r.json()).then(d => {
      setAllCommodities(d.commodities || []);
    });
  }, []);

  const selectCommodity = (c) => {
    setCommodity(c);
    setSearch("");
  };

  const fetchForecast = async (selectedCommodity, selectedState) => {
    const c = selectedCommodity || commodity;
    const s = selectedState || state;
    if (!c || !s) return;
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch(`${API}/api/predict?commodity=${encodeURIComponent(c)}&state=${encodeURIComponent(s)}&lang=${lang}`);
      const json = await res.json();
      if (json.forecast?.error) throw new Error(json.forecast.error);
      setData(json);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) { setError(e.message || "Could not fetch forecast."); }
    setLoading(false);
  };

  // Voice: "tomato maharashtra" → parse and fetch
  const handleVoice = (text) => {
    const lower = text.toLowerCase();
    const matchC = allCommodities.find(c => lower.includes(c.toLowerCase()));
    const matchS = ALL_STATES.find(s => lower.includes(s.toLowerCase()));
    if (matchC) { setCommodity(matchC); }
    if (matchS) { setState(matchS); }
    if (matchC || matchS) {
      fetchForecast(matchC || commodity, matchS || state);
    }
  };

  // Filtered list for search
  const searchResults = search.length > 1
    ? allCommodities.filter(c => c.toLowerCase().includes(search.toLowerCase())).slice(0, 30)
    : [];

  const tabList = Object.keys(CATEGORIES);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a5c2a 0%, #2d8a47 60%, #4caf6e 100%)",
        borderRadius: 16, padding: "28px 24px", color: "white", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: 20, top: 10, fontSize: 100, opacity: 0.12 }}>🌾</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4, letterSpacing: "-0.5px" }}>
          {t("app_name")}
        </h1>
        <p style={{ opacity: 0.88, fontSize: 15 }}>{t("tagline")}</p>
      </div>

      {/* ── State selector + voice ── */}
      <div className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: "1 1 220px", marginBottom: 0 }}>
            <label className="form-label">📍 {t("state")}</label>
            <select className="form-select" value={state} onChange={e => setState(e.target.value)}>
              {ALL_STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label className="form-label">🎤 {t("mic_tip")}</label>
            <MicButton onResult={handleVoice} lang={lang} />
          </div>

          {commodity && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "var(--green-pale)", borderRadius: 10, flex: "1 1 auto" }}>
              <CommodityImage commodity={commodity} size={40} showPopup={false} />
              <div>
                <div style={{ fontWeight: 700, color: "var(--green-dark)", fontSize: 14 }}>{commodity}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Selected</div>
              </div>
              <button
                className="btn btn-green"
                onClick={() => fetchForecast()}
                disabled={loading}
                style={{ marginLeft: "auto", minWidth: 140 }}
              >
                {loading ? <><span className="spinner" style={{ marginRight: 8 }} />{t("loading")}</> : t("get_forecast")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Commodity picker ── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
              🌿 Pick a Commodity
            </span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {allCommodities.length} crops available
            </span>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative" }}>
            <input
              className="form-input"
              placeholder="🔍 Search any crop — e.g. Tomato, Wheat, Rose..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 14 }}
            />
            {searchResults.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                background: "white", border: "1.5px solid var(--border)", borderRadius: 10,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)", marginTop: 4,
                maxHeight: 280, overflowY: "auto",
              }}>
                {searchResults.map(c => (
                  <div
                    key={c}
                    onClick={() => { selectCommodity(c); fetchForecast(c, state); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", cursor: "pointer",
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s",
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "var(--green-pale)"}
                    onMouseOut={e => e.currentTarget.style.background = "white"}
                  >
                    <CommodityImage commodity={c} size={36} showPopup={false} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div style={{
          display: "flex", overflowX: "auto", gap: 0,
          borderBottom: "1px solid var(--border)",
          scrollbarWidth: "none",
        }}>
          {tabList.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 16px", border: "none", cursor: "pointer",
                background: activeTab === tab ? "var(--green-pale)" : "white",
                color: activeTab === tab ? "var(--green-dark)" : "var(--text-secondary)",
                fontWeight: activeTab === tab ? 700 : 400,
                fontSize: 13, whiteSpace: "nowrap",
                borderBottom: activeTab === tab ? "2px solid var(--green-mid)" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid of commodity tiles */}
        <div style={{
          padding: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
          gap: 10,
          maxHeight: 360,
          overflowY: "auto",
        }}>
          {(CATEGORIES[activeTab] || []).map(c => {
            const isSelected = commodity === c;
            return (
              <button
                key={c}
                onClick={() => { selectCommodity(c); fetchForecast(c, state); }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "10px 6px", borderRadius: 12, cursor: "pointer",
                  border: isSelected ? "2.5px solid var(--green-mid)" : "1.5px solid var(--border)",
                  background: isSelected ? "var(--green-pale)" : "white",
                  transition: "all 0.15s", outline: "none",
                }}
                onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = "#f8fdf9"; }}
                onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = "white"; }}
              >
                <CommodityImage commodity={c} size={52} showPopup={true} />
                <span style={{
                  fontSize: 11, color: isSelected ? "var(--green-dark)" : "var(--text-secondary)",
                  fontWeight: isSelected ? 700 : 400,
                  textAlign: "center", lineHeight: 1.3,
                  wordBreak: "break-word", maxWidth: 80,
                }}>
                  {c.length > 16 ? c.slice(0, 14) + "…" : c}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <div className="alert alert-red">{error}</div>}

      {/* ── Results ── */}
      <div ref={resultsRef}>
        {loading && (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <div style={{ fontSize: 48, animation: "pulse 1s infinite" }}>🌾</div>
            <p style={{ color: "var(--text-secondary)", marginTop: 12, fontSize: 15 }}>
              Analysing {commodity} prices in {state}…
            </p>
          </div>
        )}

        {data && !loading && (
          <>
            <SignalBadge
              forecast={data.forecast}
              explanation={data.explanation}
              profitCompare={data.profit_compare}
            />
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-title">
                <CommodityImage commodity={commodity} size={28} showPopup={false} />
                📊 {t("price_trend")} — {commodity} ({state})
              </div>
              <ForecastChart forecast={data.forecast} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>
              <WeatherCard weather={data.weather} />
              <NewsCard news={data.news} commodity={commodity} />
            </div>
          </>
        )}

        {!data && !loading && (
          <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "50px 0", fontSize: 15 }}>
            👆 Click any crop above to see its price forecast
          </div>
        )}
      </div>
    </div>
  );
}
