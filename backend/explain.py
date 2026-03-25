import httpx, os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_KEY_HERE")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
LANG_NAMES = {"en": "English", "hi": "Hindi", "mr": "Marathi", "te": "Telugu", "kn": "Kannada", "ta": "Tamil"}

def _call_gemini(prompt: str, history: list = []) -> str:
    contents = []
    for h in history:
        contents.append({"role": h.get("role", "user"), "parts": [{"text": h.get("text", "")}]})
    contents.append({"role": "user", "parts": [{"text": prompt}]})
    try:
        resp = httpx.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json={"contents": contents},
            timeout=15
        )
        return resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        return f"[AI unavailable: {e}]"

def get_explanation(forecast: dict, weather: dict, commodity: str, state: str, lang: str) -> str:
    if "error" in forecast:
        return forecast["error"]
    lang_name = LANG_NAMES.get(lang, "English")
    signal = forecast.get("signal", "")
    today  = forecast.get("today_price", 0)
    pred   = forecast.get("predicted_price_3d", 0)
    gain   = forecast.get("gain_pct", 0)
    rain   = ""
    if weather and "precipitation" in weather and weather["precipitation"]:
        avg = sum(weather["precipitation"][:3]) / 3
        rain = f" Expected rainfall: {avg:.1f}mm."
    prompt = (
        f"Commodity: {commodity}, State: {state}. "
        f"Current price: ₹{today}/quintal. Forecast in 3 months: ₹{pred}/quintal ({gain:+.1f}%). "
        f"Signal: {signal}.{rain} "
        f"Write a 2-3 sentence plain explanation for a farmer in {lang_name}. Be direct and simple."
    )
    result = _call_gemini(prompt)
    if result.startswith("[AI unavailable"):
        if signal == "SELL TODAY":
            return f"आज {commodity} की कीमत ₹{today}/क्विंटल है। आगे कीमत गिरने की संभावना है। आज ही बेचें।" if lang == "hi" else f"Today's {commodity} price is ₹{today}. Prices may fall. Sell today."
        else:
            return f"{commodity} की कीमत ₹{pred} तक जा सकती है। 3 महीने रुकें।" if lang == "hi" else f"{commodity} prices may rise to ₹{pred}. Consider waiting 3 months."
    return result

def chat_with_gemini(message: str, lang: str = "en", history: list = []) -> str:
    lang_name = LANG_NAMES.get(lang, "English")
    system_context = (
        f"You are KisanSight Assistant, a helpful AI for Indian farmers and buyers. "
        f"Answer questions about crop prices, selling strategies, preservation, government schemes, "
        f"mandi operations, and farming in general. Always respond in {lang_name}. "
        f"Keep answers short, practical, and jargon-free."
    )
    full_prompt = f"{system_context}\n\nUser question: {message}"
    return _call_gemini(full_prompt, history)
