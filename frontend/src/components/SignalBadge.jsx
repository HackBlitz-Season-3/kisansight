import { useTranslation } from "react-i18next";

export default function SignalBadge({ forecast, explanation, profitCompare }) {
  const { t } = useTranslation();
  if (!forecast || forecast.error) return null;

  const isSell = forecast.signal === "SELL TODAY";
  const cls = isSell ? "badge-sell" : "badge-wait";

  return (
    <div className={cls}>
      {/* Spoil alert */}
      {forecast.spoil_alert && (
        <div className="alert alert-red" style={{ marginBottom: 12 }}>
          {t("spoil_alert")}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>{isSell ? "🛒" : "⏳"}</div>
        <div>
          <div className="badge-signal">{isSell ? t("sell_today") : t("wait")}</div>
          <div className="badge-price">
            Today: <strong>₹{forecast.today_price}/qtl</strong>
            {!isSell && (
              <span style={{ marginLeft: 12 }}>
                3 months: <strong>₹{forecast.predicted_price_3d}/qtl</strong>
                <span style={{
                  marginLeft: 8, background: "rgba(255,255,255,0.25)",
                  padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 700
                }}>
                  {forecast.gain_pct > 0 ? "+" : ""}{forecast.gain_pct}%
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profit comparison */}
      {profitCompare && (
        <div className="badge-compare">
          <div className="compare-item">
            <div className="compare-label">{t("profit_today")} (10 qtl)</div>
            <div className="compare-val">₹{profitCompare.example_10qtl_today?.toLocaleString("en-IN")}</div>
          </div>
          <div className="compare-item">
            <div className="compare-label">{t("profit_if_wait")} (10 qtl)</div>
            <div className="compare-val">₹{profitCompare.example_10qtl_3d?.toLocaleString("en-IN")}</div>
          </div>
        </div>
      )}

      {/* AI explanation */}
      {explanation && (
        <div className="badge-explain">{explanation}</div>
      )}
    </div>
  );
}
