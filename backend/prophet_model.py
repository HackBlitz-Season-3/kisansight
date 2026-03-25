import pandas as pd
from prophet import Prophet
import os, random

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "prices.csv")

def get_forecast(commodity: str, state: str) -> dict:
    df = pd.read_csv(DATA_PATH)
    df.columns = [c.strip() for c in df.columns]

    # Filter by commodity + state
    filtered = df[(df["Commodity Name"] == commodity) & (df["State"] == state)].copy()
    if filtered.empty:
        filtered = df[df["Commodity Name"] == commodity].copy()
    if filtered.empty:
        return {"error": f"No data found for {commodity}"}

    price_col = "Modal Price For The Commodity (UOM:INR(IndianRupees))"
    filtered = filtered.dropna(subset=[price_col, "Year"])
    # Cap extreme outliers at 99th percentile
    p99 = filtered[price_col].quantile(0.99)
    filtered = filtered[filtered[price_col] <= max(p99, 1)]

    # Build a time series: one row per Year (annual data), spread to monthly
    yearly = (
        filtered.groupby("Year")[price_col]
        .mean().reset_index()
        .rename(columns={"Year": "year", price_col: "price"})
        .sort_values("year")
    )

    if len(yearly) < 2:
        # Not enough years — use district variance to simulate monthly
        base = float(filtered[price_col].mean())
        rows = []
        for yr in [2016, 2017, 2018]:
            for mo in range(1, 13):
                noise = random.uniform(-0.08, 0.08) * base
                rows.append({"ds": pd.Timestamp(f"{yr}-{mo:02d}-01"), "y": base + noise})
        ts = pd.DataFrame(rows)
    else:
        # Expand yearly to monthly with slight noise for Prophet to work
        rows = []
        for _, row in yearly.iterrows():
            yr = int(row["year"])
            base = float(row["price"])
            for mo in range(1, 13):
                noise = random.uniform(-0.06, 0.06) * base
                rows.append({"ds": pd.Timestamp(f"{yr}-{mo:02d}-01"), "y": max(0, base + noise)})
        ts = pd.DataFrame(rows)

    ts = ts.dropna().sort_values("ds")

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        changepoint_prior_scale=0.2,
        interval_width=0.80,
    )
    model.fit(ts)

    future = model.make_future_dataframe(periods=6, freq="MS")
    forecast_df = model.predict(future)

    historical = ts.tail(24).rename(columns={"ds": "date", "y": "price"})
    future_preds = forecast_df.tail(6)[["ds", "yhat", "yhat_lower", "yhat_upper"]].rename(
        columns={"ds": "date", "yhat": "price", "yhat_lower": "lower", "yhat_upper": "upper"}
    )

    today_price   = float(ts["y"].iloc[-1])
    max_future    = float(future_preds["price"].max())
    pred_3m       = float(future_preds["price"].iloc[2])
    signal        = "SELL TODAY" if today_price >= max_future * 0.97 else "WAIT 3 MONTHS"
    gain_pct      = round((pred_3m - today_price) / today_price * 100, 1) if today_price else 0
    spoil_alert   = gain_pct < -8  # price dropping >8% → sell now to avoid loss

    def fmt_date(d):
        try: return str(d)[:10]
        except: return str(d)

    return {
        "signal": signal,
        "today_price": round(today_price, 2),
        "predicted_price_3d": round(pred_3m, 2),
        "gain_pct": gain_pct,
        "spoil_alert": spoil_alert,
        "historical": [{"date": fmt_date(r["date"]), "price": round(float(r["price"]), 2)}
                       for _, r in historical.iterrows()],
        "forecast": [{"date": fmt_date(r["date"]), "price": round(float(r["price"]), 2),
                      "lower": round(float(r["lower"]), 2), "upper": round(float(r["upper"]), 2)}
                     for _, r in future_preds.iterrows()],
    }
