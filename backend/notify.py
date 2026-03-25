"""
Free SMS + WhatsApp notification helper.

SMS:  Fast2SMS — https://fast2sms.com  (100 free SMS/day, no credit card)
WA:   CallMeBot — https://www.callmebot.com/blog/free-api-whatsapp-messages/
      (Free, activate once by sending a WhatsApp message to their number)

Usage:
    from notify import send_sms, send_whatsapp
    send_sms("9876543210", "Your order was accepted by Ramesh from Pune.")
    send_whatsapp("9876543210", "Your order was accepted by Ramesh from Pune.")
"""
import httpx, os

FAST2SMS_KEY   = os.getenv("FAST2SMS_KEY", "")
CALLMEBOT_KEY  = os.getenv("CALLMEBOT_KEY", "")


def send_sms(phone: str, message: str) -> bool:
    """Send SMS via Fast2SMS free tier."""
    if not FAST2SMS_KEY:
        print("[notify] FAST2SMS_KEY not set — skipping SMS")
        return False
    try:
        resp = httpx.get(
            "https://www.fast2sms.com/dev/bulkV2",
            params={
                "authorization": FAST2SMS_KEY,
                "message": message,
                "language": "english",
                "route": "q",
                "numbers": phone,
            },
            timeout=10,
        )
        result = resp.json()
        return result.get("return", False)
    except Exception as e:
        print(f"[notify] SMS failed: {e}")
        return False


def send_whatsapp(phone: str, message: str) -> bool:
    """Send WhatsApp message via CallMeBot free API."""
    if not CALLMEBOT_KEY:
        print("[notify] CALLMEBOT_KEY not set — skipping WhatsApp")
        return False
    try:
        resp = httpx.get(
            "https://api.callmebot.com/whatsapp.php",
            params={"phone": phone, "text": message, "apikey": CALLMEBOT_KEY},
            timeout=10,
        )
        return resp.status_code == 200
    except Exception as e:
        print(f"[notify] WhatsApp failed: {e}")
        return False


def notify_buyer(buyer_phone: str, farmer_name: str, farmer_phone: str,
                 commodity: str, quantity: float, district: str) -> dict:
    """Send both SMS + WhatsApp to buyer when a farmer accepts their order."""
    msg = (
        f"KisanSight: Your order for {quantity} qtl of {commodity} has been accepted! "
        f"Farmer: {farmer_name}, Contact: {farmer_phone}, "
        f"Location: {district}. Please collect from the farmer directly."
    )
    sms_ok = send_sms(buyer_phone, msg)
    wa_ok  = send_whatsapp(buyer_phone, msg)
    return {"sms_sent": sms_ok, "whatsapp_sent": wa_ok, "message": msg}
