import json
from services.gemini_service import get_prediction

def generate_renewal_prediction(account_data):

    prompt = f"""
You are a Renewal Intelligence Engine.

Analyze the following account data and return ONLY JSON.

Account Data:
{json.dumps(account_data, indent=2)}

Return format:

{{
  "renewal_percentage": 85,
  "health_status": "Healthy",
  "risk_level": "Low",
  "key_reasons": [
    "...",
    "..."
  ],
  "recommended_actions": [
    "...",
    "..."
  ]
}}
"""

    result = get_prediction(prompt)

    return result