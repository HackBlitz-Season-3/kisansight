import { useTranslation } from "react-i18next";

export default function NewsCard({ news, commodity }) {
  const { t } = useTranslation();
  return (
    <div className="card">
      <div className="card-title">📰 {t("market_news")} — {commodity}</div>
      {!news?.length ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("no_news")}</p>
      ) : (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {news.map((item, i) => (
            <li key={i} style={{ paddingBottom: 12, borderBottom: i < news.length - 1 ? "1px solid var(--border)" : "none" }}>
              <a href={item.url} target="_blank" rel="noreferrer"
                style={{ fontSize: 13, fontWeight: 500, color: "var(--green-dark)", textDecoration: "none" }}
                className="line-clamp-2">
                {item.title}
              </a>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{item.source} · {item.published}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
