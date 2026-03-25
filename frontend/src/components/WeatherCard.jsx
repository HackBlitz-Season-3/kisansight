import { useTranslation } from "react-i18next";

const icon = (rain) => rain > 10 ? "🌧️" : rain > 2 ? "🌦️" : "☀️";

export default function WeatherCard({ weather }) {
  const { t } = useTranslation();
  if (!weather || weather.error || !weather.dates?.length) return null;

  const days = weather.dates.slice(0, 5).map((date, i) => ({
    date: new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
    tmax: weather.temp_max?.[i],
    tmin: weather.temp_min?.[i],
    rain: weather.precipitation?.[i] ?? 0,
  }));

  return (
    <div className="card">
      <div className="card-title">🌤️ {t("weather_forecast")}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {days.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, padding: "6px 0", borderBottom: i < days.length - 1 ? "1px solid var(--border)" : "none" }}>
            <span style={{ width: 80, color: "var(--text-secondary)", fontSize: 13 }}>{d.date}</span>
            <span style={{ fontSize: 22 }}>{icon(d.rain)}</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{Math.round(d.tmin)}°–{Math.round(d.tmax)}°C</span>
            <span style={{ color: "#3b82f6", fontSize: 13 }}>{d.rain.toFixed(1)} mm</span>
          </div>
        ))}
      </div>
    </div>
  );
}
