import httpx

STATE_COORDS = {
    "Andhra Pradesh": (15.9129, 79.7400), "Arunachal Pradesh": (28.2180, 94.7278),
    "Assam": (26.2006, 92.9376), "Bihar": (25.0961, 85.3131),
    "Chhattisgarh": (21.2787, 81.8661), "Delhi": (28.6139, 77.2090),
    "Goa": (15.2993, 74.1240), "Gujarat": (22.2587, 71.1924),
    "Haryana": (29.0588, 76.0856), "Himachal Pradesh": (31.1048, 77.1734),
    "Jharkhand": (23.6102, 85.2799), "Karnataka": (15.3173, 75.7139),
    "Kerala": (10.8505, 76.2711), "Madhya Pradesh": (22.9734, 78.6569),
    "Maharashtra": (19.7515, 75.7139), "Manipur": (24.6637, 93.9063),
    "Meghalaya": (25.4670, 91.3662), "Mizoram": (23.1645, 92.9376),
    "Nagaland": (26.1584, 94.5624), "Odisha": (20.9517, 85.0985),
    "Puducherry": (11.9416, 79.8083), "Punjab": (31.1471, 75.3412),
    "Tamil Nadu": (11.1271, 78.6569), "Telangana": (18.1124, 79.0193),
    "Tripura": (23.9408, 91.9882), "Uttar Pradesh": (26.8467, 80.9462),
    "Uttarakhand": (30.0668, 79.0193), "West Bengal": (22.9868, 87.8550),
}

def get_weather(state: str) -> dict:
    lat, lon = STATE_COORDS.get(state, (20.5937, 78.9629))
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max"
        f"&timezone=Asia%2FKolkata&forecast_days=7"
    )
    try:
        resp = httpx.get(url, timeout=10)
        data = resp.json().get("daily", {})
        return {
            "dates": data.get("time", []),
            "temp_max": data.get("temperature_2m_max", []),
            "temp_min": data.get("temperature_2m_min", []),
            "precipitation": data.get("precipitation_sum", []),
            "wind": data.get("windspeed_10m_max", []),
        }
    except Exception as e:
        return {"error": str(e)}
