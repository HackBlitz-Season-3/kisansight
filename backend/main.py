from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from notify import notify_buyer
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import uuid, hashlib, json, os
from datetime import datetime
from prophet_model import get_forecast
from weather import get_weather
from news import get_news
from explain import get_explanation, chat_with_gemini

app = FastAPI(title="KisanSight API v2")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DB_FILE = os.path.join(os.path.dirname(__file__), "data", "db.json")

def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE) as f:
            return json.load(f)
    return {"users": {}, "sells": [], "buy_requests": [], "ratings": [], "sessions": {}}

def save_db(db):
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    with open(DB_FILE, "w") as f:
        json.dump(db, f, indent=2, default=str)

def hash_pw(pw): return hashlib.sha256(pw.encode()).hexdigest()

def get_user(token: str):
    db = load_db()
    phone = db["sessions"].get(token)
    if not phone:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    user = db["users"].get(phone)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user, phone

# ── Models ────────────────────────────────────────────────────────────────────
class RegisterReq(BaseModel):
    name: str; phone: str; password: str; role: str
    state: str; district: str; language: str = "en"
    land_acres: Optional[float] = None
    commodities: Optional[List[str]] = []
    organization: Optional[str] = None

class LoginReq(BaseModel):
    phone: str; password: str

class SellLogReq(BaseModel):
    token: str; commodity: str; quantity_qtl: float
    price_per_qtl: float; sold_on: str
    forecast_at_time: Optional[float] = None

class BuyRequestReq(BaseModel):
    token: str; commodity: str; quantity_qtl: float
    district: str; state: str; contact: str; note: Optional[str] = ""

class AcceptRequestReq(BaseModel):
    token: str; request_id: str

class RatingReq(BaseModel):
    token: str; farmer_phone: str; stars: int; comment: Optional[str] = ""

class ChatReq(BaseModel):
    message: str; lang: str = "en"; history: Optional[List[dict]] = []

# ── Auth ──────────────────────────────────────────────────────────────────────
@app.post("/api/register")
def register(req: RegisterReq):
    db = load_db()
    if req.phone in db["users"]:
        raise HTTPException(400, "Phone already registered")
    db["users"][req.phone] = {
        "name": req.name, "phone": req.phone, "password": hash_pw(req.password),
        "role": req.role, "state": req.state, "district": req.district,
        "language": req.language, "land_acres": req.land_acres,
        "commodities": req.commodities or [], "organization": req.organization,
        "joined": str(datetime.now().date()),
    }
    save_db(db)
    return {"ok": True}

@app.post("/api/login")
def login(req: LoginReq):
    db = load_db()
    user = db["users"].get(req.phone)
    if not user or user["password"] != hash_pw(req.password):
        raise HTTPException(401, "Invalid credentials")
    token = str(uuid.uuid4())
    db["sessions"][token] = req.phone
    save_db(db)
    return {"token": token, "user": {k: v for k, v in user.items() if k != "password"}}

@app.get("/api/profile")
def profile(token: str):
    user, phone = get_user(token)
    db = load_db()
    sells = [s for s in db["sells"] if s["farmer_phone"] == phone]
    total_revenue = sum(s["revenue"] for s in sells)
    ratings_received = [r for r in db["ratings"] if r["farmer_phone"] == phone]
    avg_rating = round(sum(r["stars"] for r in ratings_received) / len(ratings_received), 1) if ratings_received else None
    return {
        "user": {k: v for k, v in user.items() if k != "password"},
        "sell_count": len(sells), "total_revenue": round(total_revenue, 2),
        "avg_rating": avg_rating, "rating_count": len(ratings_received)
    }

@app.post("/api/logout")
def logout(token: str):
    db = load_db()
    db["sessions"].pop(token, None)
    save_db(db)
    return {"ok": True}

# ── Forecast ──────────────────────────────────────────────────────────────────
@app.get("/api/commodities")
def list_commodities():
    df = pd.read_csv("data/prices.csv")
    return {"commodities": sorted(df["Commodity Name"].dropna().unique().tolist())}

@app.get("/api/states")
def list_states():
    df = pd.read_csv("data/prices.csv")
    return {"states": sorted(df["State"].dropna().unique().tolist())}

@app.get("/api/districts")
def list_districts(state: str = ""):
    df = pd.read_csv("data/prices.csv")
    if state: df = df[df["State"] == state]
    return {"districts": sorted(df["District"].dropna().unique().tolist())}

@app.get("/api/predict")
def predict(commodity: str, state: str, lang: str = "en"):
    forecast = get_forecast(commodity, state)
    weather  = get_weather(state)
    news_items = get_news(commodity)
    explanation = get_explanation(forecast, weather, commodity, state, lang)
    profit_compare = None
    if "today_price" in forecast and "predicted_price_3d" in forecast:
        today  = forecast["today_price"]
        future = forecast["predicted_price_3d"]
        gain   = round(future - today, 2)
        profit_compare = {
            "sell_today_per_qtl": round(today, 2),
            "sell_3d_per_qtl": round(future, 2),
            "gain_per_qtl": gain,
            "gain_pct": forecast.get("gain_pct", 0),
            "example_10qtl_today": round(today * 10, 2),
            "example_10qtl_3d": round(future * 10, 2),
        }
    return {
        "commodity": commodity, "state": state, "forecast": forecast,
        "weather": weather, "news": news_items,
        "explanation": explanation, "profit_compare": profit_compare
    }

# ── Sell Log ──────────────────────────────────────────────────────────────────
@app.post("/api/sell-log")
def add_sell_log(req: SellLogReq):
    user, phone = get_user(req.token)
    db = load_db()
    entry = {
        "id": str(uuid.uuid4()), "farmer_phone": phone, "farmer_name": user["name"],
        "commodity": req.commodity, "quantity_qtl": req.quantity_qtl,
        "price_per_qtl": req.price_per_qtl,
        "revenue": round(req.quantity_qtl * req.price_per_qtl, 2),
        "sold_on": req.sold_on, "forecast_at_time": req.forecast_at_time,
        "profit_vs_forecast": round((req.price_per_qtl - req.forecast_at_time) * req.quantity_qtl, 2) if req.forecast_at_time else None,
        "date": str(datetime.now().date())
    }
    db["sells"].append(entry)
    save_db(db)
    return {"ok": True, "entry": entry}

@app.get("/api/sell-log")
def get_sell_log(token: str):
    user, phone = get_user(token)
    db = load_db()
    sells = sorted([s for s in db["sells"] if s["farmer_phone"] == phone], key=lambda x: x["date"], reverse=True)
    return {"sells": sells, "total_revenue": round(sum(s["revenue"] for s in sells), 2)}

# ── Marketplace ───────────────────────────────────────────────────────────────
@app.post("/api/buy-request")
def post_buy_request(req: BuyRequestReq):
    user, phone = get_user(req.token)
    db = load_db()
    entry = {
        "id": str(uuid.uuid4()), "buyer_phone": phone, "buyer_name": user["name"],
        "commodity": req.commodity, "quantity_qtl": req.quantity_qtl,
        "district": req.district, "state": req.state, "contact": req.contact,
        "note": req.note, "status": "open", "accepted_by": None,
        "date": str(datetime.now().date())
    }
    db["buy_requests"].append(entry)
    save_db(db)
    return {"ok": True, "request": entry}

@app.get("/api/buy-requests")
def get_buy_requests(state: str = "", district: str = "", commodity: str = ""):
    db = load_db()
    reqs = [r for r in db["buy_requests"] if r["status"] == "open"]
    if state:     reqs = [r for r in reqs if r["state"] == state]
    if district:  reqs = [r for r in reqs if r["district"] == district]
    if commodity: reqs = [r for r in reqs if commodity.lower() in r["commodity"].lower()]
    return {"requests": sorted(reqs, key=lambda x: x["date"], reverse=True)}

@app.post("/api/accept-request")
def accept_request(req: AcceptRequestReq):
    user, phone = get_user(req.token)
    if user["role"] != "farmer":
        raise HTTPException(403, "Only farmers can accept requests")
    db = load_db()
    for r in db["buy_requests"]:
        if r["id"] == req.request_id and r["status"] == "open":
            r["status"] = "accepted"
            r["accepted_by"] = phone
            r["accepted_by_name"] = user["name"]
            r["accepted_by_district"] = user["district"]
            r["accepted_by_state"]    = user["state"]
            r["accepted_at"] = str(datetime.now())
            save_db(db)
            msg = (f"Your order for {r['quantity_qtl']} qtl of {r['commodity']} was accepted by "
                   f"{user['name']} from {user['district']}, {user['state']}. Contact: {phone}.")
            # Fire SMS + WhatsApp (free APIs — keys optional)
            notify_result = notify_buyer(
                buyer_phone=r["contact"] or r["buyer_phone"],
                farmer_name=user["name"], farmer_phone=phone,
                commodity=r["commodity"], quantity=r["quantity_qtl"],
                district=user["district"]
            )
            return {"ok": True, "message": msg, "notifications": notify_result,
                    "farmer": {"name": user["name"], "phone": phone, "district": user["district"]}}
    raise HTTPException(404, "Request not found or already accepted")

@app.get("/api/my-requests")
def my_requests(token: str):
    user, phone = get_user(token)
    db = load_db()
    if user["role"] == "buyer":
        reqs = [r for r in db["buy_requests"] if r["buyer_phone"] == phone]
    else:
        reqs = [r for r in db["buy_requests"] if r.get("accepted_by") == phone]
    return {"requests": sorted(reqs, key=lambda x: x["date"], reverse=True)}

# ── Ratings ───────────────────────────────────────────────────────────────────
@app.post("/api/rate-farmer")
def rate_farmer(req: RatingReq):
    user, phone = get_user(req.token)
    db = load_db()
    db["ratings"].append({
        "id": str(uuid.uuid4()), "buyer_phone": phone, "buyer_name": user["name"],
        "farmer_phone": req.farmer_phone, "stars": req.stars,
        "comment": req.comment, "date": str(datetime.now().date())
    })
    save_db(db)
    return {"ok": True}

@app.get("/api/farmer-ratings")
def farmer_ratings(farmer_phone: str):
    db = load_db()
    ratings = [r for r in db["ratings"] if r["farmer_phone"] == farmer_phone]
    avg = round(sum(r["stars"] for r in ratings) / len(ratings), 1) if ratings else None
    return {"ratings": ratings, "avg": avg, "count": len(ratings)}

# ── AI Chat ───────────────────────────────────────────────────────────────────
@app.post("/api/chat")
def chat(req: ChatReq):
    response = chat_with_gemini(req.message, req.lang, req.history)
    return {"reply": response}

# ── Preservation Videos ───────────────────────────────────────────────────────
@app.get("/api/preservation")
def preservation(commodity: str, lang: str = "en"):
    lang_map = {"hi": "hindi", "mr": "marathi", "en": "english"}
    lang_str = lang_map.get(lang, "hindi")
    query = f"{commodity}+preservation+storage+method+{lang_str}"
    return {
        "commodity": commodity,
        "youtube_url": f"https://www.youtube.com/results?search_query={query}",
        "description": f"Watch videos on how to preserve {commodity} to reduce wastage and increase shelf life."
    }
