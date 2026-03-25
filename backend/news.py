import httpx, os

NEWSDATA_API_KEY = os.getenv("NEWSDATA_API_KEY", "YOUR_KEY_HERE")

def get_news(commodity: str) -> list:
    try:
        url = (
            f"https://newsdata.io/api/1/news"
            f"?apikey={NEWSDATA_API_KEY}"
            f"&q={commodity}+price+India+mandi"
            f"&language=en&country=in&category=business"
        )
        resp = httpx.get(url, timeout=10)
        articles = resp.json().get("results", [])[:5]
        return [{"title": a.get("title",""), "url": a.get("link",""),
                 "source": a.get("source_id",""), "published": a.get("pubDate","")[:10] if a.get("pubDate") else ""}
                for a in articles]
    except:
        return []
